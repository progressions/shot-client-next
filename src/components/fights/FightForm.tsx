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
  const [nameValid, setNameValid] = useState(true)
  const { createEntity, handleFormErrors } = useEntity<Fight>(
    defaultFight,
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
    // For form, we just update local state, don&apos;t save
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
      <HeroImage entity={{ image_url: data.image_url }} positionable={false} />
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
            <NumberField
              label="Season"
              value={data.season || ""}
              onChange={handleNumberFieldChange("season")}
              onBlur={handleNumberFieldChange("season")}
              required
              margin="normal"
              size="small"
              labelBackgroundColor="#363636"
            />
            {errors.season && <FormHelperText>{errors.season}</FormHelperText>}
          </FormControl>
          <FormControl margin="normal" error={!!errors.session}>
            <NumberField
              label="Session"
              value={data.session || ""}
              onChange={handleNumberFieldChange("session")}
              onBlur={handleNumberFieldChange("session")}
              required
              margin="normal"
              size="small"
              labelBackgroundColor="#363636"
            />
            {errors.session && (
              <FormHelperText>{errors.session}</FormHelperText>
            )}
          </FormControl>
        </Stack>
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
