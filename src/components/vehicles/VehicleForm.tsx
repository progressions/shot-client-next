"use client"

import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Drawer, Box, Typography, Alert, IconButton, FormHelperText } from "@mui/material"
import { HeroImage, SaveButton, CancelButton, NameEditor } from "@/components/ui"
import type { Vehicle } from "@/types"
import { defaultVehicle } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Archetype, ActionValuesEdit } from "@/components/vehicles"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import { useState, useEffect, useRef } from "react"
import { useEntity } from "@/hooks"
import { EditFaction } from "@/components/factions"

type FormStateData = Vehicle & {
  [key: string]: unknown
  image?: File | null
}

interface VehicleFormProperties {
  open: boolean
  onClose: () => void
  title: string
}

export default function VehicleForm({
  open,
  onClose,
  title,
}: VehicleFormProperties) {
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    ...defaultVehicle,
  })
  const { disabled, error, errors, data } = formState
  const { name, image } = data

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [nameValid, setNameValid] = useState(true)
  const formRef = useRef<HTMLFormElement>(null)
  const { createEntity, handleFormErrors } = useEntity<Vehicle>(
    defaultVehicle,
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
      payload: !nameValid || !!errors.name
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

  const handleNameEntityUpdate = (updatedVehicle: Vehicle) => {
    // Update the name field
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedVehicle.name,
    })
    // Clear name errors when user changes the name
    if (errors.name) {
      dispatchForm({
        type: FormActions.ERRORS,
        payload: { ...errors, name: undefined }
      })
    }
  }

  const handleNameEntitySave = async (updatedVehicle: Vehicle) => {
    // For form, we just update local state, don't save
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedVehicle.name,
    })
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
        ref={formRef}
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
        <EditFaction
          entity={data}
          updateEntity={(updatedVehicle) => {
            dispatchForm({
              type: FormActions.RESET,
              payload: { ...formState, data: updatedVehicle }
            })
          }}
        />
        <Archetype
          vehicle={data}
          updateEntity={(updatedVehicle) => {
            dispatchForm({
              type: FormActions.RESET,
              payload: { ...formState, data: updatedVehicle }
            })
          }}
        />
        <ActionValuesEdit
          key={JSON.stringify(data.action_values || {})}
          entity={data}
          size="small"
          setEntity={(updatedVehicle) => {
            dispatchForm({
              type: FormActions.UPDATE,
              name: "data",
              value: updatedVehicle,
            })
          }}
          updateEntity={async (updatedVehicle) => {
            // For form, we just update local state, don't save
            dispatchForm({
              type: FormActions.UPDATE,
              name: "data",
              value: updatedVehicle,
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
