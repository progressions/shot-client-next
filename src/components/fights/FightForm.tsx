"use client"

import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import {
  FormControl,
  FormHelperText,
  Drawer,
  Box,
  Typography,
  Alert,
  IconButton,
  Stack,
} from "@mui/material"
import {
  NumberField,
  HeroImage,
  SaveButton,
  CancelButton,
  NameEditor,
} from "@/components/ui"
import type { EditorChangeEvent, Fight } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import { useState, useEffect } from "react"
import { useEntity } from "@/hooks"
import { defaultFight } from "@/types"

type FormStateData = Fight & {
  image?: File | null
  errors?: Partial<Record<keyof Omit<FormStateData, "errors">, string>>
}

interface FightFormProperties {
  open: boolean
  onClose: () => void
}

export default function FightForm({ open, onClose }: FightFormProperties) {
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    ...defaultFight,
  })
  const { disabled, error, errors, data } = formState
  const { name, description, image } = data
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nameValid, setNameValid] = useState(true)
  const { createEntity, handleFormErrors } = useEntity<Fight>(
    defaultFight,
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

  const handleNameEntityUpdate = (updatedFight: Fight) => {
    // Update the name field
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedFight.name,
    })
    // Clear name errors when user changes the name
    if (errors.name) {
      dispatchForm({
        type: FormActions.ERRORS,
        payload: { ...errors, name: undefined },
      })
    }
  }

  const handleNameEntitySave = async (updatedFight: Fight) => {
    // For form, we just update local state, don't save
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedFight.name,
    })
  }

  const handleNumberFieldChange =
    (fieldName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: fieldName,
        value: e.target.value,
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

  const previewImage = imagePreview || data.image_url || null

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={handleClose}
    >
      <HeroImage entity={{ image_url: previewImage }} positionable={false} />
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
          New Fight
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
        <FormControl fullWidth margin="normal" error={!!errors.description}>
          <Typography variant="subtitle1" sx={{ fontSize: "0.75rem" }}>
            Description
          </Typography>
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
          {errors.description && (
            <FormHelperText>{errors.description}</FormHelperText>
          )}
        </FormControl>
        <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
          <FormControl margin="normal" error={!!errors.season}>
            <Typography variant="subtitle1" sx={{ fontSize: "0.75rem" }}>
              Season
            </Typography>
            <NumberField
              label="Season"
              value={data.season || ""}
              onChange={handleNumberFieldChange("season")}
              onBlur={handleNumberFieldChange("season")}
              required
              margin="normal"
              size="small"
            />
            {errors.season && <FormHelperText>{errors.season}</FormHelperText>}
          </FormControl>
          <FormControl margin="normal" error={!!errors.session}>
            <Typography variant="subtitle1" sx={{ fontSize: "0.75rem" }}>
              Session
            </Typography>
            <NumberField
              label="Session"
              value={data.session || ""}
              onChange={handleNumberFieldChange("session")}
              onBlur={handleNumberFieldChange("session")}
              required
              margin="normal"
              size="small"
            />
            {errors.session && (
              <FormHelperText>{errors.session}</FormHelperText>
            )}
          </FormControl>
        </Stack>
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
