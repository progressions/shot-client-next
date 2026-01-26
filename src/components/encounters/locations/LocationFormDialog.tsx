"use client"

import { useState, useEffect } from "react"
import { TextField, Box, CircularProgress, Stack } from "@mui/material"
import { Button, DialogBox } from "@/components/ui"
import type { Location } from "@/types"

interface LocationFormDialogProps {
  open: boolean
  onClose: () => void
  onSave: (location: Partial<Location>) => Promise<void>
  location?: Location | null
  title?: string
}

const COLOR_PRESETS = [
  { name: "Default", value: "" },
  { name: "Red", value: "#ffebee" },
  { name: "Blue", value: "#e3f2fd" },
  { name: "Green", value: "#e8f5e9" },
  { name: "Yellow", value: "#fffde7" },
  { name: "Purple", value: "#f3e5f5" },
  { name: "Orange", value: "#fff3e0" },
  { name: "Cyan", value: "#e0f7fa" },
  { name: "Grey", value: "#f5f5f5" },
]

/**
 * Dialog for creating or editing a location.
 * Uses the app's standard DialogBox component.
 */
export default function LocationFormDialog({
  open,
  onClose,
  onSave,
  location,
  title,
}: LocationFormDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!location?.id
  const dialogTitle = title || (isEditing ? "Edit Location" : "Add Location")

  // Reset form when dialog opens/closes or location changes
  useEffect(() => {
    if (open) {
      setName(location?.name || "")
      setDescription(location?.description || "")
      setColor(location?.color || "")
      setError(null)
    }
  }, [open, location])

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required")
      return
    }

    setSaving(true)
    setError(null)

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        color: color || undefined,
      })
      onClose()
    } catch (err) {
      console.error("Failed to save location:", err)
      setError("Failed to save location")
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <DialogBox
      open={open}
      onClose={onClose}
      title={dialogTitle}
      actions={
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {isEditing ? "Save" : "Add"}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <TextField
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          fullWidth
          required
          autoFocus
          error={!!error && !name.trim()}
          helperText={error && !name.trim() ? error : ""}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "grey.600" },
              "&:hover fieldset": { borderColor: "grey.400" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
            "& .MuiInputLabel-root": { color: "grey.400" },
            "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
          }}
        />

        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "grey.600" },
              "&:hover fieldset": { borderColor: "grey.400" },
              "&.Mui-focused fieldset": { borderColor: "primary.main" },
            },
            "& .MuiInputLabel-root": { color: "grey.400" },
            "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
          }}
        />

        <Box>
          <Box sx={{ mb: 1, fontSize: "0.875rem", color: "grey.400" }}>
            Background Color
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {COLOR_PRESETS.map(preset => (
              <Box
                key={preset.name}
                onClick={() => setColor(preset.value)}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  backgroundColor: preset.value || "grey.700",
                  border: "2px solid",
                  borderColor:
                    color === preset.value ? "primary.main" : "grey.600",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  "&:hover": {
                    borderColor: "primary.light",
                  },
                }}
                title={preset.name}
              />
            ))}
          </Box>
        </Box>

        {error && name.trim() && (
          <Box sx={{ color: "error.main", fontSize: "0.875rem" }}>{error}</Box>
        )}
      </Stack>
    </DialogBox>
  )
}
