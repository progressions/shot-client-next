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
  HeroImage,
  SaveButton,
  CancelButton,
  NameEditor,
} from "@/components/ui"
import type { EditorChangeEvent, Weapon } from "@/types"
import { defaultWeapon } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import { useState, useEffect } from "react"
import { useEntity } from "@/hooks"

type FormStateData = Weapon & {
  [key: string]: unknown
  image?: File | null
}

interface WeaponFormProperties {
  open: boolean
  onClose: () => void
  title: string
}

export default function WeaponForm({
  open,
  onClose,
  title,
}: WeaponFormProperties) {
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    ...defaultWeapon,
  })
  const { disabled, error, errors, data } = formState
  const { name, description, image } = data
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nameValid, setNameValid] = useState(true)
  const { createEntity, handleFormErrors } = useEntity<Weapon>(
    defaultWeapon,
    dispatchForm
  )

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

  const handleNameEntityUpdate = (updatedWeapon: Weapon) => {
    // Update the name field
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedWeapon.name,
    })
    // Clear name errors when user changes the name
    if (errors.name) {
      dispatchForm({
        type: FormActions.ERRORS,
        payload: { ...errors, name: undefined },
      })
    }
  }

  const handleNameEntitySave = async (updatedWeapon: Weapon) => {
    // For form, we just update local state, don&apos;t save
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedWeapon.name,
    })
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
      await createEntity(data, image)
      handleClose()
    } catch (error) {
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
