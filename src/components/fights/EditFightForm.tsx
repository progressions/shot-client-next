"use client"

import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { Drawer, Box, Typography, Alert } from "@mui/material"
import { TextField, SaveButton, CancelButton } from "@/components/ui"
import type { EditorChangeEvent, Fight } from "@/types/types"
import { useClient } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"

interface EditFightFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedFight: Fight) => void
  fight: Fight
}

type FormData = {
  name: string
  description: string
}

export default function EditFightForm({ open, onClose, onSave, fight }: EditFightFormProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormData>({
    name: fight.name || "",
    description: fight.description || ""
  })
  const { disabled, error, formData } = formState
  const { name, description } = formData

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (disabled) return
    if (!name.trim()) {
      dispatchForm({ type: FormActions.ERROR, payload: "Name is required" })
      return
    }

    dispatchForm({ type: FormActions.SUBMIT })
    try {
      const response = await client.updateFight({ id: fight.id, name, description } as Fight)
      const updatedFight = response.data
      onSave(updatedFight)
    } catch (err: unknown) {
      dispatchForm({
        type: FormActions.ERROR,
        payload: err instanceof Error ? err.message : "An error occurred"
      })
      console.error("Update fight error:", err)
    } finally {
      handleClose()
    }
  }

  const handleClose = () => {
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
          Edit Fight
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
            console.log("Editor onChange:", e.target.value)
            dispatchForm({ type: FormActions.UPDATE, name: "description", value: e.target.value })
          }}
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
