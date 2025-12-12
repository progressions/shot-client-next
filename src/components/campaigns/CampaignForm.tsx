"use client"

import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Drawer, Box, Typography, Alert, FormHelperText } from "@mui/material"
import {
  InfoLink,
  HeroImage,
  SaveButton,
  CancelButton,
  NameEditor,
} from "@/components/ui"
import type { EditorChangeEvent, Campaign, CampaignCableData } from "@/types"
import { defaultCampaign } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"
import { useState, useEffect, useCallback, useRef } from "react"
import { useEntity } from "@/hooks"
import { useApp, useCampaign } from "@/contexts"
import { SeedingStatus } from "@/components/campaigns"

type FormStateData = Campaign & {
  [key: string]: unknown
  image?: File | null
  _tempImageFile?: File
}

interface CampaignFormProperties {
  open: boolean
  onClose: () => void
  title: string
  onCampaignCreated?: () => void
}

export default function CampaignForm({
  open,
  onClose,
  title,
  onCampaignCreated,
}: CampaignFormProperties) {
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    ...defaultCampaign,
  })
  const { disabled, error, errors, data } = formState
  const { name, description, image } = data
  const [nameValid, setNameValid] = useState(true)
  const [createdCampaign, setCreatedCampaign] = useState<Campaign | null>(null)
  // Use refs to track values without causing re-renders
  const createdCampaignIdRef = useRef<string | null>(null)
  const lastSeedingStatusRef = useRef<string | null>(null)
  const lastImagesCompletedRef = useRef<number | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { createEntity, handleFormErrors } = useEntity<Campaign>(
    defaultCampaign,
    dispatchForm
  )
  const { refreshUser } = useApp()
  const { subscribeToEntity, campaignData } = useCampaign()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  // Handle seeding status updates from WebSocket
  // The seeding_status key in the WebSocket payload triggers this callback
  const handleSeedingUpdate = useCallback(
    (seedingStatus: string, data?: CampaignCableData) => {
      // Use ref to check if we have a created campaign (avoid dependency on state)
      const campaignId = createdCampaignIdRef.current
      if (!campaignId) return

      // Get the full data from campaignData if we only received the status
      const fullData = data || campaignData

      // Check if this update is for our campaign
      if (fullData?.campaign_id && fullData.campaign_id !== campaignId) return

      // Skip update if nothing changed (prevent infinite loops)
      const imagesCompleted = fullData?.images_completed ?? null
      if (
        seedingStatus === lastSeedingStatusRef.current &&
        imagesCompleted === lastImagesCompletedRef.current
      ) {
        return
      }

      console.log("🌱 CampaignForm: Updating seeding status", {
        seedingStatus,
        imagesCompleted,
        fullData,
      })

      // Update refs to track latest values
      lastSeedingStatusRef.current = seedingStatus
      lastImagesCompletedRef.current = imagesCompleted

      // Update the created campaign with new seeding status
      setCreatedCampaign(prev =>
        prev
          ? {
              ...prev,
              seeding_status: seedingStatus || prev.seeding_status,
              seeding_images_total:
                fullData?.images_total ?? prev.seeding_images_total,
              seeding_images_completed:
                fullData?.images_completed ?? prev.seeding_images_completed,
              is_seeding: seedingStatus !== "complete",
              is_seeded: seedingStatus === "complete",
            }
          : prev
      )

      // Close when complete
      if (seedingStatus === "complete") {
        console.log("🎉 CampaignForm: Seeding complete! Closing drawer...")
        // Clear any existing timeout to prevent duplicates
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current)
        }
        closeTimeoutRef.current = setTimeout(() => {
          onCampaignCreated?.()
          handleClose()
        }, 1000) // Brief delay to show "Complete" status
      }
    },
    [campaignData, onCampaignCreated, handleClose]
  )

  // Subscribe to seeding_status updates from WebSocket
  // The seeding broadcasts have keys like seeding_status, campaign_id, images_total, etc.
  useEffect(() => {
    if (createdCampaign) {
      const unsubscribe = subscribeToEntity(
        "seeding_status",
        (status: unknown) => {
          handleSeedingUpdate(status as string)
        }
      )
      return () => unsubscribe()
    }
  }, [createdCampaign, subscribeToEntity, handleSeedingUpdate])

  // Also check campaignData directly for seeding updates
  useEffect(() => {
    if (
      campaignData &&
      createdCampaign &&
      campaignData.seeding_status &&
      campaignData.campaign_id === createdCampaign.id
    ) {
      console.log("🌱 CampaignForm: Direct campaignData seeding update", {
        campaignData,
      })
      handleSeedingUpdate(
        campaignData.seeding_status as string,
        campaignData as CampaignCableData
      )
    }
  }, [campaignData, createdCampaign, handleSeedingUpdate])

  // Cleanup timeout on unmount to prevent stale closures
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    dispatchForm({
      type: FormActions.DISABLE,
      payload: !nameValid || !!errors.name,
    })
  }, [nameValid, errors.name, dispatchForm])

  const handleEntityUpdate = (updatedCampaign: Campaign) => {
    // Update specific fields that might change from PositionableImage component
    if (updatedCampaign.image_url !== data.image_url) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "image_url",
        value: updatedCampaign.image_url,
      })
    }

    // Handle temporary image file for creation mode
    if (updatedCampaign._tempImageFile !== data._tempImageFile) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "_tempImageFile",
        value: updatedCampaign._tempImageFile,
      })
    }

    // Handle position changes
    if (updatedCampaign.x_position !== data.x_position) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "x_position",
        value: updatedCampaign.x_position,
      })
    }

    if (updatedCampaign.y_position !== data.y_position) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "y_position",
        value: updatedCampaign.y_position,
      })
    }
  }

  const handleNameEntityUpdate = (updatedCampaign: Campaign) => {
    // Update the name field
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedCampaign.name,
    })
    // Clear name errors when user changes the name
    if (errors.name) {
      dispatchForm({
        type: FormActions.ERRORS,
        payload: { ...errors, name: undefined },
      })
    }
  }

  const handleNameEntitySave = async (updatedCampaign: Campaign) => {
    // For form, we just update local state, don&apos;t save
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedCampaign.name,
    })
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    console.log("🚀 Campaign form submit started", {
      name: name.trim(),
      disabled,
    })
    if (disabled) return
    if (!name.trim()) {
      dispatchForm({ type: FormActions.ERROR, payload: "Name is required" })
      return
    }
    dispatchForm({ type: FormActions.SUBMIT })
    try {
      // Check if we have a temporary image file from PositionableImage upload
      const imageFile = image || data._tempImageFile
      const newCampaign = await createEntity(data, imageFile)

      console.log("🚀 Campaign created:", {
        newCampaign,
        formName: name,
        formData: data,
      })

      // Store the created campaign to track seeding progress
      // Set initial seeding state
      // Use form data name as fallback since API response might not include it
      const campaignWithSeeding = {
        ...newCampaign,
        name: newCampaign.name || name.trim(),
        is_seeding: true,
        is_seeded: false,
        seeding_status: "schticks", // Will be updated by WebSocket
      }
      // Set ref first so callbacks can use it immediately
      createdCampaignIdRef.current = newCampaign.id
      lastSeedingStatusRef.current = "schticks"
      lastImagesCompletedRef.current = null
      setCreatedCampaign(campaignWithSeeding)

      // Refresh user data to update onboarding progress
      await refreshUser()

      // Dispatch custom event to notify campaigns list to reload
      const campaignCreatedEvent = new CustomEvent("campaignCreated")
      window.dispatchEvent(campaignCreatedEvent)

      // Additional event dispatch with delay to ensure event listeners are ready
      setTimeout(() => {
        const delayedEvent = new CustomEvent("campaignCreated")
        window.dispatchEvent(delayedEvent)
      }, 500)

      // Don't close - wait for seeding to complete
      // onCampaignCreated?.() will be called when seeding completes
    } catch (error) {
      console.error("❌ Campaign creation failed:", error)
      handleFormErrors(error)
    }
  }

  const handleClose = useCallback(() => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    dispatchForm({ type: FormActions.RESET, payload: initialFormState })
    setCreatedCampaign(null)
    // Reset refs
    createdCampaignIdRef.current = null
    lastSeedingStatusRef.current = null
    lastImagesCompletedRef.current = null
    onClose()
  }, [dispatchForm, initialFormState, onClose])

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={createdCampaign ? undefined : handleClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : "30rem",
          minWidth: isMobile ? "100%" : "30rem",
          maxWidth: isMobile ? "100%" : "30rem",
          flexShrink: 0,
        },
      }}
    >
      {createdCampaign ? (
        // Show seeding progress
        <Box
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
            Setting up &quot;{createdCampaign.name}&quot;
          </Typography>
          <SeedingStatus campaign={createdCampaign} variant="detailed" />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, textAlign: "center", maxWidth: 300 }}
          >
            Please wait while we set up your campaign with schticks, weapons,
            characters, and more...
          </Typography>
        </Box>
      ) : (
        // Show creation form
        <>
          <HeroImage
            entity={formState.data}
            setEntity={handleEntityUpdate}
            creationMode={true}
            pageContext="edit"
            height={400}
          />
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              height: isMobile ? "auto" : "100%",
              p: isMobile ? "1rem" : "2rem",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: "#ffffff" }}>
              {title}
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Typography>
              A <InfoLink href="/campaigns" info="Campaign" /> is a collection
              of <InfoLink href="/characters" info="Characters" /> battling
              against various evil <InfoLink href="/factions" info="Factions" />{" "}
              for control of the <InfoLink info="Chi War" />. You can create,
              edit, and delete campaigns.
            </Typography>
            <NameEditor
              entity={data}
              setEntity={handleNameEntityUpdate}
              updateEntity={handleNameEntitySave}
              onValidationChange={setNameValid}
            />
            {errors.name && (
              <FormHelperText error sx={{ mt: -1, mb: 1 }}>
                {errors.name}
              </FormHelperText>
            )}
            <Editor
              name="description"
              value={description}
              onChange={(e: EditorChangeEvent) => {
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "description",
                  value: e.target.value,
                })
              }}
            />
            <Box sx={{ display: "flex", gap: "1rem", mt: 3 }}>
              <SaveButton type="submit" disabled={disabled}>
                Save
              </SaveButton>
              <CancelButton onClick={handleClose}>Cancel</CancelButton>
            </Box>
          </Box>
        </>
      )}
    </Drawer>
  )
}
