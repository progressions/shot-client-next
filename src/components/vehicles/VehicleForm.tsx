"use client"

import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Drawer, Box, Typography, Alert, FormHelperText } from "@mui/material"
import {
  HeroImage,
  SaveButton,
  CancelButton,
  NameEditor,
} from "@/components/ui"
import type { Vehicle } from "@/types"
import { defaultVehicle } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Archetype, ActionValuesEdit } from "@/components/vehicles"
import { useState, useEffect, useRef } from "react"
import { useEntity } from "@/hooks"
import { EditFaction } from "@/components/factions"

type FormStateData = Vehicle & {
  [key: string]: unknown
  image?: File | null
  _tempImageFile?: File
}

interface VehicleFormProperties {
  open: boolean
  onClose: () => void
  title: string
  onVehicleCreated?: () => void
}

export default function VehicleForm({
  open,
  onClose,
  title,
  onVehicleCreated,
}: VehicleFormProperties) {
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    ...defaultVehicle,
  })
  const { disabled, error, errors, data } = formState
  const { name, image } = data

  const [nameValid, setNameValid] = useState(true)
  const formRef = useRef<HTMLFormElement>(null)
  const { createEntity, handleFormErrors } = useEntity<Vehicle>(
    defaultVehicle,
    dispatchForm
  )

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    dispatchForm({
      type: FormActions.DISABLE,
      payload: !nameValid || !!errors.name,
    })
  }, [nameValid, errors.name, dispatchForm])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
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
      onVehicleCreated?.()
      handleClose()
    } catch (error) {
      handleFormErrors(error)
    }
  }

  const handleEntityUpdate = (updatedVehicle: Vehicle) => {
    // Update specific fields that might change from PositionableImage component
    if (updatedVehicle.image_url !== data.image_url) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "image_url",
        value: updatedVehicle.image_url,
      })
    }

    // Handle temporary image file for creation mode
    if (updatedVehicle._tempImageFile !== data._tempImageFile) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "_tempImageFile",
        value: updatedVehicle._tempImageFile,
      })
    }

    // Handle position changes
    if (updatedVehicle.x_position !== data.x_position) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "x_position",
        value: updatedVehicle.x_position,
      })
    }

    if (updatedVehicle.y_position !== data.y_position) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "y_position",
        value: updatedVehicle.y_position,
      })
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
        payload: { ...errors, name: undefined },
      })
    }
  }

  const handleNameEntitySave = async (updatedVehicle: Vehicle) => {
    // For form, we just update local state, don&apos;t save
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedVehicle.name,
    })
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
          updateEntity={updatedVehicle => {
            dispatchForm({
              type: FormActions.RESET,
              payload: { ...formState, data: updatedVehicle },
            })
          }}
        />
        <Archetype
          vehicle={data}
          updateEntity={updatedVehicle => {
            dispatchForm({
              type: FormActions.RESET,
              payload: { ...formState, data: updatedVehicle },
            })
          }}
        />
        <ActionValuesEdit
          key={JSON.stringify(data.action_values || {})}
          entity={data}
          size="small"
          setEntity={updatedVehicle => {
            dispatchForm({
              type: FormActions.UPDATE,
              name: "data",
              value: updatedVehicle,
            })
          }}
          updateEntity={async updatedVehicle => {
            // For form, we just update local state, don&apos;t save
            dispatchForm({
              type: FormActions.UPDATE,
              name: "data",
              value: updatedVehicle,
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
