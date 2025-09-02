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
  Box
} from "@mui/material"
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
  { value: "success", label: "Success (Green)" }
]

export default function AddEffectModal({ open, onClose, character }: AddEffectModalProps) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  
  const [saving, setSaving] = useState(false)
  const [effect, setEffect] = useState<Partial<CharacterEffect>>({
    name: "",
    description: "",
    severity: "info" as Severity,
    action_value: "",
    change: "",
    character_id: character.id,
    shot_id: character.shot_id
  })

  // Define available action values based on character type
  const actionValues = character.entity_class === "Vehicle"
    ? [
        { label: "Acceleration", value: "Acceleration" },
        { label: "Handling", value: "Handling" },
        { label: "Frame", value: "Frame" },
        { label: "Crunch", value: "Crunch" }
      ]
    : [
        { label: "Attack", value: "MainAttack" },
        { label: "Defense", value: "Defense" },
        { label: "Toughness", value: "Toughness" },
        { label: "Speed", value: "Speed" },
        { label: "Damage", value: "Damage" },
        { label: "Fortune", value: "Fortune" }
      ]

  const handleChange = (field: keyof CharacterEffect) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEffect(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSubmit = async () => {
    if (!effect.name) {
      toastError("Effect name is required")
      return
    }

    setSaving(true)
    try {
      // Only send action_value and change if they have values
      const effectToSend: any = {
        ...effect,
        action_value: effect.action_value || undefined,
        change: effect.change || undefined
      }
      
      await client.createCharacterEffect(encounter, effectToSend as CharacterEffect)
      toastSuccess(`Added effect: ${effect.name}`)
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
      description: "",
      severity: "info" as Severity,
      action_value: "",
      change: "",
      character_id: character.id,
      shot_id: character.shot_id
    })
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add Effect to {character.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Effect Name"
              value={effect.name}
              onChange={handleChange("name")}
              fullWidth
              required
              autoFocus
              placeholder="e.g., Stunned, Blessed, Wounded"
            />
            <TextField
              select
              label="Severity"
              value={effect.severity}
              onChange={handleChange("severity")}
              sx={{ minWidth: 150 }}
            >
              {severityOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label="Description (Optional)"
            value={effect.description}
            onChange={handleChange("description")}
            fullWidth
            multiline
            rows={2}
            placeholder="Additional details about the effect"
          />

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
          disabled={saving || !effect.name}
        >
          {saving ? "Adding..." : "Add Effect"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}