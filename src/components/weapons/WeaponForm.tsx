"use client"

import Image from "next/image"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Stack, Drawer, Box, Typography, Alert, IconButton } from "@mui/material"
import { TextField, SaveButton, CancelButton } from "@/components/ui"
import type { EditorChangeEvent, Weapon } from "@/types/types"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import { useState, useEffect } from "react"
import { InfoLink } from "@/components/links"

type FormStateData = {
  name: string
  description: string
  damage: number
  concealment: number
  reload_value: number
  image?: File | null
}

interface WeaponFormProps {
  open: boolean
  onClose: () => void
  onSave: (formData: FormData, weaponData: Weapon) => Promise<void>
  initialFormData: FormStateData
  title: string
  existingImageUrl?: string | null
}

export default function WeaponForm({ open, onClose, onSave, initialFormData, title, existingImageUrl }: WeaponFormProps) {
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>(initialFormData)
  const { disabled, error, data } = formState
  const { name, description, damage, concealment, reload_value, image } = data
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
      const weaponData = { name, description, damage, concealment, reload_value } as Weapon
      formData.append("weapon", JSON.stringify(weaponData))
      if (image) {
        formData.append("image", image)
      }
      await onSave(formData, weaponData)
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
        <Stack direction="row" spacing={2} my={2}>
          <TextField
            label="Damage"
            value={damage || ""}
            type="number"
            onChange={(e) => dispatchForm({ type: FormActions.UPDATE, name: "damage", value: parseInt(e.target.value as string, 10)})}
            margin="normal"
            required
            sx={{width: 80}}
          />
          <TextField
            label="Concealment"
            value={concealment || ""}
            type="number"
            onChange={(e) => dispatchForm({ type: FormActions.UPDATE, name: "concealment", value: e.target.value || "" })}
            margin="normal"
            sx={{width: 80}}
          />
          <TextField
            label="Reload"
            value={reload_value || ""}
            type="number"
            onChange={(e) => dispatchForm({ type: FormActions.UPDATE, name: "reload_value", value: e.target.value || "" })}
            margin="normal"
            sx={{width: 80}}
          />
        </Stack>
        <Typography>Typical weapon <InfoLink info="Damage" /> is 9, only extreme weapons are 12 or higher. For <InfoLink info="Concealment" /> and <InfoLink info="Reload" />, lower is better.</Typography>
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
              alt="Weapon image preview"
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
