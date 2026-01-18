"use client"

import { Box, Typography, Stack } from "@mui/material"
import { NumberField } from "@/components/ui"
import type {
  Shot,
  Character,
  AttackFormData,
  DefenseChoice,
  Encounter,
} from "@/types"
import { getDefenseModifiersText } from "./defenseModifierUtils"
import { updateMookDistribution } from "./targetSectionUtils"

export interface MookDistributionProps {
  allShots: Shot[]
  selectedTargetIds: string[]
  mookDistribution: { [targetId: string]: number }
  totalAttackingMooks: number
  attacker: Character | undefined
  stunt: boolean
  defenseChoicePerTarget: { [targetId: string]: DefenseChoice }
  fortuneDiePerTarget: { [targetId: string]: string }
  encounter: Encounter
  updateField: (name: keyof AttackFormData, value: unknown) => void
}

/**
 * MookDistribution component
 *
 * Displays and manages the distribution of attacking mooks across multiple targets.
 * Shows a number field for each target to adjust how many mooks attack that target.
 * For exactly 2 targets, automatically adjusts the other target's count.
 */
export default function MookDistribution({
  allShots,
  selectedTargetIds,
  mookDistribution,
  totalAttackingMooks,
  attacker,
  stunt,
  defenseChoicePerTarget,
  fortuneDiePerTarget,
  encounter,
  updateField,
}: MookDistributionProps) {
  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <Typography
        variant="caption"
        sx={{ mb: 0.5, fontWeight: "bold", color: "text.secondary" }}
      >
        MOOK DISTRIBUTION ({totalAttackingMooks} total)
      </Typography>
      <Stack spacing={0.5}>
        {selectedTargetIds.map(id => {
          const shot = allShots.find(s => s.character?.shot_id === id)
          const char = shot?.character
          if (!char) return null

          return (
            <Box
              key={id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                backgroundColor: "background.paper",
                p: 0.5,
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <NumberField
                  name={`mookDist-${id}`}
                  value={mookDistribution[id] || 0}
                  size="small"
                  width="80px"
                  error={false}
                  onChange={e => {
                    updateMookDistribution(
                      id,
                      parseInt(e.target.value) || 0,
                      selectedTargetIds,
                      mookDistribution,
                      attacker?.count || 0,
                      updateField
                    )
                  }}
                  onBlur={e => {
                    // onBlur is already handled by onChange for NumberField buttons
                    // Only process if this is a real blur event (not from buttons)
                    if (e.relatedTarget?.closest(".MuiIconButton-root")) {
                      return // Skip if blur was caused by clicking increment/decrement buttons
                    }

                    updateMookDistribution(
                      id,
                      parseInt(e.target.value) || 0,
                      selectedTargetIds,
                      mookDistribution,
                      attacker?.count || 0,
                      updateField
                    )
                  }}
                />
                <Typography variant="caption" sx={{ mt: 0.5 }}>
                  mooks
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "medium",
                  }}
                >
                  {char.name}
                </Typography>
                {/* Always show defense modifiers if any exist */}
                {(() => {
                  const modifiersText = getDefenseModifiersText(
                    char,
                    stunt,
                    defenseChoicePerTarget[id],
                    fortuneDiePerTarget[id],
                    encounter,
                    "Defense"
                  )
                  return modifiersText ? (
                    <Typography
                      variant="caption"
                      sx={{
                        fontStyle: "italic",
                        color: "text.secondary",
                        display: "block",
                      }}
                    >
                      {modifiersText}
                    </Typography>
                  ) : null
                })()}
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
