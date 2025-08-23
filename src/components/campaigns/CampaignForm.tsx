"use client"

import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import {
  Drawer,
  Box,
  Typography,
  Alert,
  IconButton,
  FormHelperText,
} from "@mui/material"
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
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import { useState, useEffect } from "react"
import { useEntity } from "@/hooks"
import { useApp } from "@/contexts"

type FormStateData = Campaign & {
  [key: string]: unknown
  image?: File | null
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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nameValid, setNameValid] = useState(true)
  const { createEntity, handleFormErrors } = useEntity<Campaign>(
    defaultCampaign,
    dispatchForm
  )
  const { refreshUser } = useApp()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    if (image) {
      const previewUrl = URL.createObjectURL(image)
      setImagePreview(previewUrl)
      return () => URL.revokeObjectURL(previewUrl)
    } else {
      setImagePreview(null)
    }
  }, [image])

  useEffect(() => {
    dispatchForm({
      type: FormActions.DISABLE,
      payload: !nameValid || !!errors.name,
    })
  }, [nameValid, errors.name, dispatchForm])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!/^image\/(webp|jpeg|png|gif)$/.test(file.type)) {
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Image must be WEBP, JPEG, PNG, or GIF",
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Image must be less than 5MB",
        })
        return
      }
      dispatchForm({ type: FormActions.UPDATE, name: "image", value: file })
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
    // For form, we just update local state, don't save
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedCampaign.name,
    })
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    console.log("🚀 Campaign form submit started", { name: name.trim(), disabled })
    if (disabled) return
    if (!name.trim()) {
      dispatchForm({ type: FormActions.ERROR, payload: "Name is required" })
      return
    }
    dispatchForm({ type: FormActions.SUBMIT })
    try {
      console.log("📝 Creating campaign...", data)
      await createEntity(data, image)
      console.log("✅ Campaign created successfully, refreshing user data...")
      // Refresh user data to update onboarding progress
      await refreshUser()
      console.log("🔄 User data refreshed, calling onCampaignCreated callback...")
      
      // Dispatch custom event to notify campaigns list to reload
      const campaignCreatedEvent = new CustomEvent('campaignCreated')
      window.dispatchEvent(campaignCreatedEvent)
      console.log("📡 Dispatched campaignCreated event")
      
      onCampaignCreated?.()
      handleClose()
    } catch (error) {
      console.error("❌ Campaign creation failed:", error)
      handleFormErrors(error)
    }
  }

  const handleClose = () => {
    dispatchForm({ type: FormActions.RESET, payload: initialFormState })
    setImagePreview(null)
    onClose()
  }

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={handleClose}
    >
      <HeroImage entity={formState.data} />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: isMobile ? "100%" : "30rem",
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
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: "1rem" }}>
          <IconButton component="label">
            <AddPhotoAlternateIcon sx={{ color: "#ffffff" }} />
            <input
              type="file"
              hidden
              accept="image/webp,image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
            />
          </IconButton>
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            Update Image
          </Typography>
        </Box>
        {imagePreview && <HeroImage entity={{ image_url: imagePreview }} />}
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
