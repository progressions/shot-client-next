"use client"

import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import {
  Stack,
  Drawer,
  Box,
  Typography,
  Alert,
  IconButton,
} from "@mui/material"
import { InfoLink, HeroImage, TextField, SaveButton, CancelButton } from "@/components/ui"
import type { EditorChangeEvent, Weapon } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import { useState, useEffect } from "react"
import {
  WeaponJunctureAutocomplete,
  WeaponCategoryAutocomplete,
} from "@/components/autocomplete"

type FormStateData = Weapon & {
  [key: string]: unknown
  image?: File | null
}

interface WeaponFormProperties {
  open: boolean
  onClose: () => void
  onSave: (formData: FormData, weaponData: Weapon) => Promise<void>
  initialFormData: FormStateData
  title: string
}

export default function WeaponForm({
  open,
  onClose,
  onSave,
  initialFormData,
  title,
}: WeaponFormProperties) {
  const { formState, dispatchForm, initialFormState } =
    useForm<FormStateData>(initialFormData)
  const { disabled, error, data } = formState
  const {
    name,
    description,
    juncture,
    category,
    damage,
    concealment,
    reload_value,
    kachunk,
    mook_bonus,
    image,
  } = data
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
      const weaponData = {
        name,
        description,
        damage,
        concealment,
        reload_value,
        category,
        juncture,
        kachunk,
        mook_bonus,
      } as Weapon
      formData.append("weapon", JSON.stringify(weaponData))
      if (image) {
        formData.append("image", image)
      }
      await onSave(formData, weaponData)
    } catch (error_: unknown) {
      const errorMessage = "An error occurred."
      dispatchForm({ type: FormActions.ERROR, payload: errorMessage })
      console.error(`${title} error:`, error_)
    } finally {
      handleClose()
    }
  }

  const handleClose = () => {
    dispatchForm({ type: FormActions.RESET, payload: initialFormState })
    setImagePreview(null)
    onClose()
  }

  const handleJunctureChange = async (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "juncture", value })
  }

  const handleCategoryChange = async (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "category", value })
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
        <TextField
          label="Name"
          value={name}
          onChange={e =>
            dispatchForm({
              type: FormActions.UPDATE,
              name: "name",
              value: e.target.value,
            })
          }
          margin="normal"
          required
          autoFocus
        />
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
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <WeaponJunctureAutocomplete
            value={juncture || ""}
            onChange={handleJunctureChange}
          />
          <WeaponCategoryAutocomplete
            value={category || ""}
            onChange={handleCategoryChange}
          />
        </Stack>
        <Stack direction="row" spacing={2} my={2}>
          <TextField
            label="Damage"
            value={damage || ""}
            type="number"
            onChange={e =>
              dispatchForm({
                type: FormActions.UPDATE,
                name: "damage",
                value: Number.parseInt(e.target.value, 10),
              })
            }
            margin="normal"
            required
            sx={{ width: 80 }}
          />
          <TextField
            label="Concealment"
            value={concealment || ""}
            type="number"
            onChange={e =>
              dispatchForm({
                type: FormActions.UPDATE,
                name: "concealment",
                value: e.target.value || "",
              })
            }
            margin="normal"
            sx={{ width: 80 }}
          />
          <TextField
            label="Reload"
            value={reload_value || ""}
            type="number"
            onChange={e =>
              dispatchForm({
                type: FormActions.UPDATE,
                name: "reload_value",
                value: e.target.value || "",
              })
            }
            margin="normal"
            sx={{ width: 80 }}
          />
        </Stack>
        <Typography>
          Typical weapon <InfoLink info="Damage" /> is 9, only extreme weapons
          are 12 or higher. For <InfoLink info="Concealment" /> and{" "}
          <InfoLink info="Reload" />, lower is better.
        </Typography>
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
