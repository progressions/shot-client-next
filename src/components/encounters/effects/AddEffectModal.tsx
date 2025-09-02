"use client"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  IconButton,
} from "@mui/material"
import CircleIcon from "@mui/icons-material/Circle"
import { useState } from "react"
import { useEncounter, useToast, useClient } from "@/contexts"
import type { Character, CharacterEffect } from "@/types"

interface AddEffectModalProps {
  open: boolean
  onClose: () => void
  character: Character
}

type Severity = "error" | "warning" | "info" | "success"

const severityOptions: { value: Severity; label: string }[] = [
  { value: "error", label: "Danger (Red)" },
  { value: "warning", label: "Warning (Yellow)" },
  { value: "info", label: "Info (Blue)" },
  { value: "success", label: "Success (Green)" },
]

export default function AddEffectModal({
  open,
  onClose,
  character,
}: AddEffectModalProps) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  const [saving, setSaving] = useState(false)
  const [effect, setEffect] = useState<Partial<CharacterEffect>>({
    name: "",
    severity: "info" as Severity,
    action_value: "",
    change: "",
    character_id: character.id,
    shot_id: character.shot_id,
  })

  // Define available action values based on character type
  const actionValues =
    character.entity_class === "Vehicle"
      ? [
          { label: "Acceleration", value: "Acceleration" },
          { label: "Handling", value: "Handling" },
          { label: "Frame", value: "Frame" },
          { label: "Crunch", value: "Crunch" },
        ]
      : [
          { label: "Attack", value: "MainAttack" },
          { label: "Defense", value: "Defense" },
          { label: "Toughness", value: "Toughness" },
          { label: "Speed", value: "Speed" },
          { label: "Damage", value: "Damage" },
          { label: "Fortune", value: "Fortune" },
        ]

  const handleChange =
    (field: keyof CharacterEffect) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEffect(prev => ({
        ...prev,
        [field]: event.target.value,
      }))
    }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      // Only send action_value and change if they have values
      const effectToSend: Partial<CharacterEffect> = {
        ...effect,
        name: effect.name || undefined,
        action_value: effect.action_value || undefined,
        change: effect.change || undefined,
      }

      await client.createCharacterEffect(
        encounter,
        effectToSend as CharacterEffect
      )
      toastSuccess(effect.name ? `Added effect: ${effect.name}` : "Added effect")
      handleClose()
    } catch (error) {
      toastError("Failed to add effect")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setEffect({
      name: "",
      severity: "info" as Severity,
      action_value: "",
      change: "",
      character_id: character.id,
      shot_id: character.shot_id,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Effect to {character.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Effect Name (Optional)"
              value={effect.name}
              onChange={handleChange("name")}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !saving) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              fullWidth
              autoFocus
              placeholder="e.g., Stunned, Blessed, Wounded"
            />
            <Stack direction="row" spacing={0.5}>
              {severityOptions.map(option => (
                <IconButton
                  key={option.value}
                  onClick={() =>
                    setEffect(prev => ({ ...prev, severity: option.value }))
                  }
                  sx={{
                    p: 0.25,
                    border: effect.severity === option.value ? 2 : 0,
                    borderColor:
                      effect.severity === option.value
                        ? "primary.main"
                        : "transparent",
                  }}
                >
                  <CircleIcon
                    sx={{
                      color:
                        option.value === "error"
                          ? "error.main"
                          : option.value === "warning"
                            ? "warning.main"
                            : option.value === "info"
                              ? "info.main"
                              : "success.main",
                      fontSize: 24,
                    }}
                  />
                </IconButton>
              ))}
            </Stack>
          </Stack>

          <Box>
            <Box sx={{ mb: 1 }}>
              <strong>Attribute Modification (Optional)</strong>
            </Box>
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Attribute"
                value={effect.action_value}
                onChange={handleChange("action_value")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !saving) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {actionValues.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Change"
                value={effect.change}
                onChange={handleChange("change")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !saving) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                fullWidth
                placeholder="+2, -1, or 18"
                helperText="Use +/- for modifiers or number for absolute"
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
        >
          {saving ? "Adding..." : "Add Effect"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
