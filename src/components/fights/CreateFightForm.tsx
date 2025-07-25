"use client"

import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Drawer, Box, Typography, Alert } from "@mui/material"
import { TextField, SaveButton, CancelButton } from "@/components/ui"
import type { Fight } from "@/types/types"
import { useClient } from "@/contexts"
import { FormActions, useForm } from "@/reducers"

interface CreateFightFormProps {
  open: boolean
  onClose: () => void
  onSave: (newFight: Fight) => void
}

type FormData = {
  name: string
  description: string
}

export default function CreateFightForm({ open, onClose, onSave }: CreateFightFormProps) {
  const { client } = useClient()
  const { formState, dispatchForm, initialFormState } = useForm<FormData>({
    name: "",
    description: ""
  })
  const { disabled, error, formData } = formState
  const { name, description } = formData

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault() // Prevent default form submission behavior
    if (disabled) return
    if (!name.trim()) {
      dispatchForm({ type: FormActions.ERROR, payload: "Name is required" })
      return
    }

    dispatchForm({ type: FormActions.SET_DISABLED, payload: true })
    try {
      const response = await client.createFight({ name, description } as Fight)
      const newFight = response.data
      onSave(newFight)
      handleClose()
    } catch (err) {
      dispatchForm({ type: FormActions.ERROR, payload: err instanceof Error ? err.message : "An error occurred" })
      console.error("Create fight error:", err)
    } finally {
      dispatchForm({ type: FormActions.SET_DISABLED, payload: false })
    }
  }

  const handleClose = () => {
    dispatchForm({ type: FormActions.RESET, payload: initialFormState })
    onClose()
  }

  return (
    <Drawer anchor={isMobile ? "bottom" : "right"} open={open} onClose={handleClose}>
      <Box
        component="form"
        onSubmit={handleSave}
        sx={{ width: isMobile ? "100%" : "30rem", height: isMobile ? "auto" : "100%", p: isMobile ? "1rem" : "2rem" }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: "#ffffff" }}>
          New Fight
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
        <TextField
          label="Description"
          value={description}
          onChange={(e) => dispatchForm({ type: FormActions.UPDATE, name: "description", value: e.target.value })}
          margin="normal"
          multiline
          rows={4}
        />
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
