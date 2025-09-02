"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  Grid,
} from "@mui/material"
import { NumberField } from "@/components/ui"
import { useClient, useToast, useEncounter } from "@/contexts"
import { CS } from "@/services"
import type { Character } from "@/types"

interface CharacterEditDialogProps {
  open: boolean
  onClose: () => void
  character: Character
}

export default function CharacterEditDialog({
  open,
  onClose,
  character,
}: CharacterEditDialogProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { encounter } = useEncounter()

  // Form state
  const [name, setName] = useState(character.name)
  const [currentShot, setCurrentShot] = useState<number>(0)
  const [wounds, setWounds] = useState<number>(0)
  const [impairments, setImpairments] = useState<number>(0)
  const [marksOfDeath, setMarksOfDeath] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  // Helper to check if character is PC
  const isPC = () => CS.isPC(character)

  // Initialize form values when dialog opens
  useEffect(() => {
    if (open) {
      setName(character.name || "")
      // Get current shot from character's shot_id data
      // For now, using the current_shot field if available
      const characterWithShot = character as Character & {
        current_shot?: number | string
      }
      const shot = characterWithShot.current_shot || 0
      setCurrentShot(
        typeof shot === "number" ? shot : parseInt(String(shot)) || 0
      )

      // Get wounds from action_values
      setWounds(character.action_values?.Wounds || 0)

      // Get marks of death from action_values
      setMarksOfDeath(character.action_values?.["Marks of Death"] || 0)

      // Get impairments based on character type
      if (isPC()) {
        // For PCs, impairments are on the character model
        setImpairments(character.impairments || 0)
      } else {
        // For non-PCs, impairments would be on the shot association
        // We'll need to get this from the shot data
        const characterWithShotImpairments = character as Character & {
          shot_impairments?: number
        }
        setImpairments(
          characterWithShotImpairments.shot_impairments ||
            character.impairments ||
            0
        )
      }
    }
  }, [open, character])

  // Validation
  const isValid = () => {
    return (
      name.trim().length > 0 &&
      wounds >= 0 &&
      impairments >= 0 &&
      marksOfDeath >= 0
    )
  }

  // Handle save
  const handleSave = async () => {
    if (!isValid()) {
      toastError("Please check your input values")
      return
    }

    setLoading(true)
    try {
      // Prepare character update payload
      interface CharacterUpdate {
        name: string
        action_values: Record<string, unknown>
        impairments?: number
      }

      const characterUpdate: CharacterUpdate = {
        name: name.trim(),
        action_values: {
          ...character.action_values,
          Wounds: wounds,
          "Marks of Death": marksOfDeath,
        },
      }

      // Add impairments for PCs
      if (isPC()) {
        characterUpdate.impairments = impairments
      }

      // Update character
      await client.updateCharacterCombatStats(character.id, characterUpdate)

      // Update shot if we have shot data
      if (character.shot_id) {
        interface ShotUpdate {
          shot_id: string
          current_shot: number
          impairments?: number
        }

        const shotUpdate: ShotUpdate = {
          shot_id: character.shot_id,
          current_shot: currentShot,
        }

        // Add impairments for non-PCs
        if (!isPC()) {
          shotUpdate.impairments = impairments
        }

        // Update shot (we'll need to implement this method)
        await client.updateCharacterShot(encounter, character, shotUpdate)
      }

      toastSuccess(`Updated ${name}`)
      onClose()
    } catch (error) {
      console.error("Error updating character:", error)
      toastError(`Failed to update ${character.name}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit {character.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 2 }}>
          {/* Name field */}
          <TextField
            fullWidth
            label="Character Name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            size="small"
            error={name.trim().length === 0}
            helperText={name.trim().length === 0 ? "Name is required" : ""}
          />

          {/* Combat Stats Row */}
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Current Shot
                </Typography>
                <NumberField
                  value={currentShot}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement> | number
                  ) => {
                    const val =
                      typeof e === "object" && "target" in e
                        ? e.target.value
                        : e
                    setCurrentShot(
                      typeof val === "number" ? val : parseInt(String(val)) || 0
                    )
                  }}
                  onBlur={() => {}}
                  disabled={loading}
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Wounds
                </Typography>
                <NumberField
                  value={wounds}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement> | number
                  ) => {
                    const val =
                      typeof e === "object" && "target" in e
                        ? e.target.value
                        : e
                    setWounds(
                      typeof val === "number" ? val : parseInt(String(val)) || 0
                    )
                  }}
                  onBlur={() => {}}
                  min={0}
                  disabled={loading}
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Impairments
                </Typography>
                <NumberField
                  value={impairments}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement> | number
                  ) => {
                    const val =
                      typeof e === "object" && "target" in e
                        ? e.target.value
                        : e
                    setImpairments(
                      typeof val === "number" ? val : parseInt(String(val)) || 0
                    )
                  }}
                  onBlur={() => {}}
                  min={0}
                  disabled={loading}
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={3}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Marks of Death
                </Typography>
                <NumberField
                  value={marksOfDeath}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement> | number
                  ) => {
                    const val =
                      typeof e === "object" && "target" in e
                        ? e.target.value
                        : e
                    setMarksOfDeath(
                      typeof val === "number" ? val : parseInt(String(val)) || 0
                    )
                  }}
                  onBlur={() => {}}
                  min={0}
                  disabled={loading}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !isValid()}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
