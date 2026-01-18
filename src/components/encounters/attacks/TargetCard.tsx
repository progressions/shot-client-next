"use client"

import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { CS, CES } from "@/services"
import { NumberField } from "@/components/ui"
import { CharacterHeader, Wounds } from "@/components/encounters"
import DodgeControls from "./DodgeControls"
import type {
  Character,
  AttackFormData,
  DefenseChoice,
  Encounter,
  CalculateTargetDefenseFn,
} from "@/types"

export interface TargetCardProps {
  targetId: string
  target: Character
  stunt: boolean
  targetMookCountPerTarget: { [targetId: string]: number }
  defenseChoicePerTarget: { [targetId: string]: DefenseChoice }
  fortuneDiePerTarget: { [targetId: string]: string }
  manualDefensePerTarget: { [targetId: string]: number }
  manualToughnessPerTarget: { [targetId: string]: number }
  selectedTargetIds: string[]
  attacker: Character | undefined
  encounter: Encounter
  calculateTargetDefense: CalculateTargetDefenseFn
  updateField: (name: keyof AttackFormData, value: unknown) => void
  updateFields: (updates: Partial<AttackFormData>) => void
  updateDefenseAndToughness: (
    targetIds: string[],
    includeStunt: boolean,
    defenseChoices?: { [targetId: string]: DefenseChoice },
    fortuneDice?: { [targetId: string]: string },
    manualDefense?: { [targetId: string]: number }
  ) => void
}

/**
 * TargetCard component
 *
 * Displays an individual target with their character info, wounds,
 * defense/toughness controls, and dodge controls.
 */
export default function TargetCard({
  targetId,
  target,
  stunt,
  targetMookCountPerTarget,
  defenseChoicePerTarget,
  fortuneDiePerTarget,
  manualDefensePerTarget,
  manualToughnessPerTarget,
  selectedTargetIds,
  attacker,
  encounter,
  calculateTargetDefense,
  updateField,
  updateFields,
  updateDefenseAndToughness,
}: TargetCardProps) {
  const theme = useTheme()
  const isMook = CS.isMook(target)

  // Calculate defense value - either from manual override or calculated
  const defenseValue =
    targetId in manualDefensePerTarget
      ? manualDefensePerTarget[targetId]
      : calculateTargetDefense(
          target,
          targetId,
          manualDefensePerTarget as { [targetId: string]: string },
          defenseChoicePerTarget,
          fortuneDiePerTarget,
          stunt,
          attacker,
          isMook ? targetMookCountPerTarget[targetId] || 1 : 1,
          encounter
        )

  // Handle defense value change
  const handleDefenseChange = (value: string) => {
    const newVal = parseInt(value) || 0
    const newManualDefense = {
      ...manualDefensePerTarget,
      [targetId]: newVal,
    }
    updateField("manualDefensePerTarget", newManualDefense)
    updateDefenseAndToughness(
      selectedTargetIds,
      stunt,
      defenseChoicePerTarget,
      fortuneDiePerTarget,
      newManualDefense
    )
  }

  // Handle mook count change
  const handleMookCountChange = (value: string) => {
    const count = Math.max(1, parseInt(value) || 1)

    // Clear manual defense override when count changes
    // This allows the defense to auto-update with the new count
    const newManualDefense = {
      ...manualDefensePerTarget,
    }
    delete newManualDefense[targetId]

    // Update both fields together to ensure proper re-render
    updateFields({
      targetMookCountPerTarget: {
        ...targetMookCountPerTarget,
        [targetId]: count,
      },
      manualDefensePerTarget: newManualDefense,
    })

    // Recalculate defense immediately with updated counts
    updateDefenseAndToughness(
      selectedTargetIds,
      stunt,
      defenseChoicePerTarget,
      fortuneDiePerTarget,
      newManualDefense
    )
  }

  // Handle toughness value change
  const handleToughnessChange = (value: string) => {
    const newVal = parseInt(value) || 0
    updateField("manualToughnessPerTarget", {
      ...manualToughnessPerTarget,
      [targetId]: newVal,
    })
  }

  // Get toughness value
  const toughnessValue =
    manualToughnessPerTarget[targetId] ??
    CES.adjustedActionValue(target, "Toughness", encounter, true)[1]

  return (
    <Box>
      {/* All content in single paper background box */}
      <Box
        sx={{
          p: 1,
          backgroundColor: "background.paper",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Character Display */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Box
            sx={{
              minWidth: { xs: 40, sm: 56 },
              mr: { xs: 1, sm: 2 },
            }}
          >
            <Wounds character={target} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <CharacterHeader character={target} />
          </Box>
        </Box>

        {/* Defense/Toughness Controls and Dodge - horizontal below character */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 2,
            mb: 1,
            alignItems: "flex-start",
          }}
        >
          {/* Defense field */}
          <Box>
            <NumberField
              name={`defense-${targetId}`}
              label="Defense"
              labelBackgroundColor="#131313"
              value={defenseValue}
              size="small"
              width="80px"
              error={false}
              onChange={e => handleDefenseChange(e.target.value)}
              onBlur={e => handleDefenseChange(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  "& input": { padding: "8px 12px" },
                  backgroundColor: "background.paper",
                },
              }}
            />
          </Box>

          {/* Show Count field for mooks, Toughness for others */}
          {isMook ? (
            <Box>
              <NumberField
                name={`count-${targetId}`}
                label="Count"
                labelBackgroundColor="#131313"
                value={targetMookCountPerTarget[targetId] || 1}
                size="small"
                width="80px"
                error={false}
                onChange={e => handleMookCountChange(e.target.value)}
                onBlur={e => handleMookCountChange(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 40,
                    "& input": { padding: "8px 12px" },
                    backgroundColor: "background.paper",
                  },
                }}
              />
            </Box>
          ) : (
            <Box>
              <NumberField
                name={`toughness-${targetId}`}
                label="Toughness"
                labelBackgroundColor={theme.palette.background.paper}
                value={toughnessValue}
                size="small"
                width="80px"
                error={false}
                onChange={e => handleToughnessChange(e.target.value)}
                onBlur={e => handleToughnessChange(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 40,
                    "& input": { padding: "8px 12px" },
                    backgroundColor: "background.paper",
                  },
                }}
              />
            </Box>
          )}

          {/* Dodge buttons - only for non-mooks */}
          {!isMook && (
            <Box sx={{ flex: 1 }}>
              <DodgeControls
                targetId={targetId}
                target={target}
                defenseChoice={defenseChoicePerTarget[targetId]}
                fortuneDie={fortuneDiePerTarget[targetId]}
                manualDefensePerTarget={manualDefensePerTarget}
                defenseChoicePerTarget={defenseChoicePerTarget}
                fortuneDiePerTarget={fortuneDiePerTarget}
                selectedTargetIds={selectedTargetIds}
                stunt={stunt}
                updateFields={updateFields}
                updateDefenseAndToughness={updateDefenseAndToughness}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
