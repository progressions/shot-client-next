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
import type { EditorChangeEvent, Faction } from "@/types"
import { defaultFaction } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"
import { useState, useEffect } from "react"
import { useEntity } from "@/hooks"

type FormStateData = Faction & {
  [key: string]: unknown
  image?: File | null
  _tempImageFile?: File
}

interface FactionFormProperties {
  open: boolean
  onClose: () => void
  title: string
}

export default function FactionForm({
  open,
  onClose,
  title,
}: FactionFormProperties) {
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    ...defaultFaction,
  })
  const { disabled, error, errors, data } = formState
  const { name, description, image } = data
  const [nameValid, setNameValid] = useState(true)
  const { createEntity, handleFormErrors } = useEntity<Faction>(
    defaultFaction,
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

  const handleEntityUpdate = (updatedFaction: Faction) => {
    // Update specific fields that might change from PositionableImage component
    if (updatedFaction.image_url !== data.image_url) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "image_url",
        value: updatedFaction.image_url,
      })
    }

    // Handle temporary image file for creation mode
    if (updatedFaction._tempImageFile !== data._tempImageFile) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "_tempImageFile",
        value: updatedFaction._tempImageFile,
      })
    }

    // Handle position changes
    if (updatedFaction.x_position !== data.x_position) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "x_position",
        value: updatedFaction.x_position,
      })
    }

    if (updatedFaction.y_position !== data.y_position) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "y_position",
        value: updatedFaction.y_position,
      })
    }
  }

  const handleNameEntityUpdate = (updatedFaction: Faction) => {
    // Update the name field
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedFaction.name,
    })
    // Clear name errors when user changes the name
    if (errors.name) {
      dispatchForm({
        type: FormActions.ERRORS,
        payload: { ...errors, name: undefined },
      })
    }
  }

  const handleNameEntitySave = async (updatedFaction: Faction) => {
    // For form, we just update local state, don&apos;t save
    dispatchForm({
      type: FormActions.UPDATE,
      name: "name",
      value: updatedFaction.name,
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
      // Check if we have a temporary image file from PositionableImage upload
      const imageFile = image || data._tempImageFile
      await createEntity(data, imageFile)
      handleClose()
    } catch (error) {
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
