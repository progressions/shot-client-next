"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
} from "@mui/material"
import { NumberField } from "@/components/ui"
import { useClient, useToast, useEncounter } from "@/contexts"
import { CS } from "@/services"
import type { Character } from "@/types"

interface HealDialogProps {
  open: boolean
  onClose: () => void
  character: Character
}

export default function HealDialog({
  open,
  onClose,
  character,
}: HealDialogProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { encounter, updateEncounter } = useEncounter()

  const [healAmount, setHealAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  // Get current wounds
  const currentWounds = CS.wounds(character) || 0
  const woundsLabel = CS.isMook(character) ? "Mooks" : "Wounds"

  // Reset heal amount when dialog opens
  useEffect(() => {
    if (open) {
      setHealAmount(0)
    }
  }, [open])

  const handleHeal = async () => {
    if (healAmount <= 0) {
      return // Don't show error, just don't submit
    }

    setLoading(true)
    try {
      // Calculate new wounds value (minimum 0)
      const newWounds = Math.max(0, currentWounds - healAmount)

      // Prepare update based on character type
      interface CharacterUpdate {
        action_values?: Record<string, unknown>
      }

      const characterUpdate: CharacterUpdate = {}

      if (CS.isPC(character)) {
        // For PCs, wounds are stored in action_values
        characterUpdate.action_values = {
          ...character.action_values,
          Wounds: newWounds,
        }

        // Update the character
        await client.updateCharacterCombatStats(character.id, characterUpdate)
      } else {
        // For non-PCs, we need to update the shot count
        if (character.shot_id && encounter) {
          await client.updateCharacterShot(encounter, character, {
            shot_id: character.shot_id,
            count: newWounds,
          })
        }
      }

      // Refresh the encounter
      if (encounter) {
        const updatedEncounterResponse = await client.getEncounter(encounter)
        if (updatedEncounterResponse.data) {
          updateEncounter(updatedEncounterResponse.data)
        }
      }

      const healedAmount = currentWounds - newWounds
      toastSuccess(
        `Healed ${healedAmount} ${woundsLabel.toLowerCase()} from ${character.name}`
      )
      onClose()
    } catch (error) {
      console.error("Error healing character:", error)
      toastError(`Failed to heal ${character.name}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Heal {character.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 2 }}>
          <Typography variant="body2">
            Current {woundsLabel}: {currentWounds}
          </Typography>

          <Box
            onKeyDown={e => {
              if (e.key === "Enter" && healAmount > 0 && !loading) {
                e.preventDefault()
                handleHeal()
              }
            }}
          >
            <NumberField
              value={healAmount}
              onChange={(e: React.ChangeEvent<HTMLInputElement> | number) => {
                const val =
                  typeof e === "object" && "target" in e ? e.target.value : e
                setHealAmount(
                  typeof val === "number" ? val : parseInt(String(val)) || 0
                )
              }}
              onBlur={() => {}}
              min={0}
              max={currentWounds}
              disabled={loading}
              size="small"
              fullWidth
            />
          </Box>

          {healAmount > 0 && (
            <Typography variant="caption" color="text.secondary">
              Will reduce {woundsLabel.toLowerCase()} to{" "}
              {Math.max(0, currentWounds - healAmount)}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleHeal}
          variant="contained"
          color="success"
          disabled={loading || healAmount <= 0}
        >
          {loading ? "Healing..." : "Heal"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
