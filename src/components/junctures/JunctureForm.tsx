"use client"

import Image from "next/image"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Drawer, Box, Typography, Alert, IconButton } from "@mui/material"
import { TextField, SaveButton, CancelButton } from "@/components/ui"
import type { EditorChangeEvent, Juncture } from "@/types"
import { defaultJuncture } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import { useState, useEffect } from "react"
import { FactionsAutocomplete } from "@/components/autocomplete"
import { InfoLink } from "@/components/links"

type FormStateData = Juncture & {
  [key: string]: unknown
  image?: File | null
}

interface JunctureFormProps {
  open: boolean
  onClose: () => void
  onSave: (formData: FormData, junctureData: Juncture) => Promise<void>
  initialFormData: FormStateData
  title: string
  existingImageUrl?: string | null
}

export default function JunctureForm({ open, onClose, onSave, initialFormData, title, existingImageUrl }: JunctureFormProps) {
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>(initialFormData)
  const { disabled, error, data } = formState
  const { name, description, faction_id, image } = data
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.match(/^image\/(webp|jpeg|png|gif)$/)) {
        dispatchForm({ type: FormActions.ERROR, payload: "Image must be WEBP, JPEG, PNG, or GIF" })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        dispatchForm({ type: FormActions.ERROR, payload: "Image must be less than 5MB" })
        return
      }
      dispatchForm({ type: FormActions.UPDATE, name: "image", value: file })
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (disabled) return
    if (!name.trim()) {
      dispatchForm({ type: FormActions.ERROR, payload: "Name is required" })
      return
    }

    dispatchForm({ type: FormActions.SUBMIT })
    try {
      const formData = new FormData()
      const junctureData = { ...defaultJuncture, name, description, faction_id } as Juncture
      formData.append("juncture", JSON.stringify(junctureData))
      if (image) {
        formData.append("image", image)
      }
      await onSave(formData, junctureData)
    } catch (err: unknown) {
      const errorMessage = "An error occurred."
      dispatchForm({ type: FormActions.ERROR, payload: errorMessage })
      console.error(`${title} error:`, err)
    } finally {
      handleClose()
    }
  }

  const handleClose = () => {
    dispatchForm({ type: FormActions.RESET, payload: initialFormState })
    setImagePreview(null)
    onClose()
  }

  const handleFactionChange = async (value: string | null): Promise<void> => {
    dispatchForm({ type: FormActions.UPDATE, name: "faction_id", value })
  }

  return (
    <Drawer anchor={isMobile ? "bottom" : "right"} open={open} onClose={handleClose}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ width: isMobile ? "100%" : "30rem", height: isMobile ? "auto" : "100%", p: isMobile ? "1rem" : "2rem" }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: "#ffffff" }}>
          {title}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography>A <InfoLink href="/junctures" info="Juncture" /> is a period in time which has <InfoLink info="Portals" /> opening to the <InfoLink info="Netherworld" />. A Juncture is controlled by the <InfoLink href="/factions" info="Faction" /> which controlls the most powerful <InfoLink href="/sites" info="Feng Shui Sites" />.</Typography>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => dispatchForm({ type: FormActions.UPDATE, name: "name", value: e.target.value })}
          margin="normal"
          required
          autoFocus
        />
        <Editor
          name="description"
          value={description}
          onChange={(e: EditorChangeEvent) => {
            dispatchForm({ type: FormActions.UPDATE, name: "description", value: e.target.value })
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography sx={{mb: 2}}>A <InfoLink href="/juncture" info="Juncture" /> belongs to a certain <InfoLink href="/factions" info="Faction" /> that controls the most powerful <InfoLink href="/sites" info="Feng Shuite Sites" />.</Typography>
          <FactionsAutocomplete
            value={faction_id || ""}
            onChange={handleFactionChange}
          />
        </Box>
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
            {image ? image.name : existingImageUrl ? "Current image" : "No image selected"}
          </Typography>
        </Box>
        {(imagePreview || existingImageUrl) && (
          <Box sx={{ mt: 2 }}>
            <Image
              src={imagePreview || existingImageUrl || ""}
              alt="Juncture image preview"
              width={isMobile ? 150 : 200}
              height={isMobile ? 150 : 200}
              style={{
                width: "100%",
                maxHeight: isMobile ? "150px" : "200px",
                objectFit: "contain"
              }}
            />
          </Box>
        )}
        <Box sx={{ display: "flex", gap: "1rem", mt: 3 }}>
          <SaveButton type="submit" disabled={disabled}>
            Save
          </SaveButton>
          <CancelButton onClick={handleClose}>
            Cancel
          </CancelButton>
        </Box>
      </Box>
    </Drawer>
  )
}
