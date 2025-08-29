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
import type { EditorChangeEvent, Campaign } from "@/types"
import { defaultCampaign } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"
import { useState, useEffect } from "react"
import { useEntity } from "@/hooks"
import { useApp } from "@/contexts"

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
  const { createEntity, handleFormErrors } = useEntity<Campaign>(
    defaultCampaign,
    dispatchForm
  )
  const { refreshUser } = useApp()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

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
      await createEntity(data, imageFile)
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

      onCampaignCreated?.()
      handleClose()
    } catch (error) {
      console.error("❌ Campaign creation failed:", error)
      handleFormErrors(error)
    }
  }

  const handleClose = () => {
    dispatchForm({ type: FormActions.RESET, payload: initialFormState })
    onClose()
  }

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: isMobile ? "100%" : "30rem",
          minWidth: isMobile ? "100%" : "30rem",
          maxWidth: isMobile ? "100%" : "30rem",
          flexShrink: 0,
        },
      }}
    >
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
          A <InfoLink href="/campaigns" info="Campaign" /> is a collection of{" "}
          <InfoLink href="/characters" info="Characters" /> battling against
          various evil <InfoLink href="/factions" info="Factions" /> for control
          of the <InfoLink info="Chi War" />. You can create, edit, and delete
          campaigns.
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
    </Drawer>
  )
}
