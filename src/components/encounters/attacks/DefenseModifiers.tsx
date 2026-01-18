"use client"

import {
  Box,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material"
import { CS } from "@/services"
import { NumberField } from "@/components/ui"
import type { Shot, Character, AttackFormData, DefenseChoice } from "@/types"

export interface DefenseModifiersProps {
  allShots: Shot[]
  selectedTargetIds: string[]
  attacker: Character | undefined
  stunt: boolean
  defenseValue: string
  manualDefensePerTarget: { [targetId: string]: number }
  allTargetsAreMooks: boolean
  updateField: (name: keyof AttackFormData, value: unknown) => void
  updateDefenseAndToughness: (
    targetIds: string[],
    includeStunt: boolean,
    defenseChoices?: { [targetId: string]: DefenseChoice },
    fortuneDice?: { [targetId: string]: string },
    manualDefense?: { [targetId: string]: number }
  ) => void
}

/**
 * DefenseModifiers component
 *
 * Displays the combined defense value for multiple targets and the stunt checkbox.
 * Only shown when targets are selected.
 */
export default function DefenseModifiers({
  allShots,
  selectedTargetIds,
  attacker,
  stunt,
  defenseValue,
  manualDefensePerTarget,
  allTargetsAreMooks,
  updateField,
  updateDefenseAndToughness,
}: DefenseModifiersProps) {
  // Handle stunt checkbox change
  const handleStuntChange = (isChecked: boolean) => {
    updateField("stunt", isChecked)

    // Update defense values based on stunt
    if (selectedTargetIds.length === 1) {
      // Single target - update manualDefensePerTarget
      const targetId = selectedTargetIds[0]
      const shot = allShots.find(s => s.character?.shot_id === targetId)
      const target = shot?.character
      if (target) {
        const baseDefense = CS.defense(target)
        const newDefense = isChecked ? baseDefense + 2 : baseDefense
        updateField("manualDefensePerTarget", {
          ...manualDefensePerTarget,
          [targetId]: newDefense,
        })
      }
    } else if (selectedTargetIds.length > 1) {
      // Multiple targets - update defenseValue
      const defenses = selectedTargetIds.map(id => {
        const shot = allShots.find(s => s.character?.shot_id === id)
        const target = shot?.character
        if (!target) return 0
        const baseDefense = CS.defense(target)
        return isChecked ? baseDefense + 2 : baseDefense
      })
      const highestDefense = Math.max(...defenses)
      const combinedDefense = highestDefense + selectedTargetIds.length
      updateField("defenseValue", combinedDefense.toString())
    }

    // Also recalculate with the helper function
    if (selectedTargetIds.length > 0) {
      updateDefenseAndToughness(selectedTargetIds, isChecked)
    }
  }

  // Calculate total modifiers for display
  const calculateModifiersTotal = (): number => {
    let total = 0
    if (stunt) total += 2
    return total
  }

  const modifiersTotal = calculateModifiersTotal()
  const isMookAttacker = attacker && CS.isMook(attacker)

  return (
    <Box sx={{ mb: 1, mt: 2 }}>
      <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
        {/* Defense Value - show for multiple targets when non-mook attacker */}
        {selectedTargetIds.length > 1 && attacker && !isMookAttacker && (
          <Box>
            <NumberField
              name="defenseValue"
              label="Defense"
              value={parseInt(defenseValue || "0") || 0}
              size="small"
              width="80px"
              error={false}
              disabled={false}
              onChange={e => updateField("defenseValue", e.target.value)}
              onBlur={e => updateField("defenseValue", e.target.value)}
            />
            <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
              (Highest + {selectedTargetIds.length}
              {allTargetsAreMooks ? " groups" : ""})
            </Typography>
            {modifiersTotal > 0 && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  fontStyle: "italic",
                  color: "text.secondary",
                }}
              >
                +{modifiersTotal} modifiers
              </Typography>
            )}
          </Box>
        )}

        {/* Stunt Checkbox - only show when targets selected */}
        {selectedTargetIds.length > 0 && (
          <FormControlLabel
            control={
              <Checkbox
                checked={stunt}
                size="small"
                onChange={e => handleStuntChange(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption">Stunt (+2 Defense)</Typography>
            }
            sx={{ m: 0 }}
          />
        )}
      </Stack>
    </Box>
  )
}
