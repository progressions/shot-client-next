"use client"

import { Box, Button } from "@mui/material"
import { NumberField } from "@/components/ui"
import { CS } from "@/services"
import type { Character, AttackFormData, DefenseChoice } from "@/types"

export interface DodgeControlsProps {
  targetId: string
  target: Character
  defenseChoice: DefenseChoice | undefined
  fortuneDie: string | undefined
  manualDefensePerTarget: { [targetId: string]: number }
  defenseChoicePerTarget: { [targetId: string]: DefenseChoice }
  fortuneDiePerTarget: { [targetId: string]: string }
  selectedTargetIds: string[]
  stunt: boolean
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
 * DodgeControls component
 *
 * Handles the dodge and fortune dice controls for a target.
 * Three states:
 * 1. No dodge - shows "Dodge" button
 * 2. Dodge active - shows "Dodging" button with optional Fortune button for PCs
 * 3. Fortune dodge active - shows fortune number field and cancel button
 */
export default function DodgeControls({
  targetId,
  target,
  defenseChoice,
  fortuneDie,
  manualDefensePerTarget,
  defenseChoicePerTarget,
  fortuneDiePerTarget,
  selectedTargetIds,
  stunt,
  updateFields,
  updateDefenseAndToughness,
}: DodgeControlsProps) {
  const baseDefense = CS.defense(target)

  // Helper to handle starting a dodge
  const handleStartDodge = () => {
    const dodgeDefense = baseDefense + 3

    const newOverrides = {
      ...manualDefensePerTarget,
      [targetId]: dodgeDefense,
    }

    const newDefenseChoices = {
      ...defenseChoicePerTarget,
      [targetId]: "dodge" as DefenseChoice,
    }

    updateFields({
      defenseChoicePerTarget: newDefenseChoices,
      manualDefensePerTarget: newOverrides,
    })

    updateDefenseAndToughness(
      selectedTargetIds,
      stunt,
      newDefenseChoices,
      fortuneDiePerTarget,
      newOverrides
    )
  }

  // Helper to handle canceling a dodge
  const handleCancelDodge = () => {
    const newChoices = {
      ...defenseChoicePerTarget,
    }
    delete newChoices[targetId]

    const newOverrides = {
      ...manualDefensePerTarget,
      [targetId]: baseDefense,
    }

    updateFields({
      defenseChoicePerTarget: newChoices,
      manualDefensePerTarget: newOverrides,
    })

    updateDefenseAndToughness(
      selectedTargetIds,
      stunt,
      newChoices,
      fortuneDiePerTarget,
      newOverrides
    )
  }

  // Helper to handle starting fortune dodge (from regular dodge)
  const handleStartFortuneDodge = () => {
    const dodgeDefense = baseDefense + 3

    const newOverrides = {
      ...manualDefensePerTarget,
      [targetId]: dodgeDefense,
    }

    const newDefenseChoices = {
      ...defenseChoicePerTarget,
      [targetId]: "fortune" as DefenseChoice,
    }

    const newFortuneDice = {
      ...fortuneDiePerTarget,
      [targetId]: "0",
    }

    updateFields({
      defenseChoicePerTarget: newDefenseChoices,
      fortuneDiePerTarget: newFortuneDice,
      manualDefensePerTarget: newOverrides,
    })

    updateDefenseAndToughness(
      selectedTargetIds,
      stunt,
      newDefenseChoices,
      newFortuneDice,
      newOverrides
    )
  }

  // Helper to handle fortune die value change
  const handleFortuneChange = (value: string) => {
    const fortuneValue = parseInt(value) || 0
    const newFortuneDice = {
      ...fortuneDiePerTarget,
      [targetId]: value,
    }

    const totalDefense = baseDefense + 3 + fortuneValue
    const newOverrides = {
      ...manualDefensePerTarget,
      [targetId]: totalDefense,
    }

    updateFields({
      fortuneDiePerTarget: newFortuneDice,
      manualDefensePerTarget: newOverrides,
    })

    updateDefenseAndToughness(
      selectedTargetIds,
      stunt,
      defenseChoicePerTarget,
      newFortuneDice,
      newOverrides
    )
  }

  // Helper to cancel fortune dodge (go back to regular dodge)
  const handleCancelFortuneDodge = () => {
    const newFortuneDice = {
      ...fortuneDiePerTarget,
    }
    delete newFortuneDice[targetId]

    const dodgeDefense = baseDefense + 3
    const newOverrides = {
      ...manualDefensePerTarget,
      [targetId]: dodgeDefense,
    }

    const newDefenseChoices = {
      ...defenseChoicePerTarget,
      [targetId]: "dodge" as DefenseChoice,
    }

    updateFields({
      defenseChoicePerTarget: newDefenseChoices,
      fortuneDiePerTarget: newFortuneDice,
      manualDefensePerTarget: newOverrides,
    })

    updateDefenseAndToughness(
      selectedTargetIds,
      stunt,
      newDefenseChoices,
      newFortuneDice,
      newOverrides
    )
  }

  // State 1: No dodge active
  if (defenseChoice !== "dodge" && defenseChoice !== "fortune") {
    return (
      <Button
        variant="outlined"
        size="small"
        onClick={handleStartDodge}
        sx={{ minWidth: "80px" }}
      >
        Dodge
      </Button>
    )
  }

  // State 2: Regular dodge active
  if (defenseChoice === "dodge") {
    return (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Button
          variant="contained"
          size="small"
          color="success"
          onClick={handleCancelDodge}
          sx={{ minWidth: "80px" }}
        >
          Dodging
        </Button>

        {/* Fortune button for PCs - only shows when regular dodge is active */}
        {CS.isPC(target) && (
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            onClick={handleStartFortuneDodge}
            sx={{ minWidth: "40px", px: 1 }}
            title="Add Fortune to Dodge"
          >
            +🎲
          </Button>
        )}
      </Box>
    )
  }

  // State 3: Fortune dodge active
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          alignItems: "center",
        }}
      >
        <NumberField
          name={`fortuneDie-${targetId}`}
          label="Fortune"
          labelBackgroundColor="#202020"
          value={parseInt(fortuneDie || "0") || 0}
          size="small"
          width="80px"
          error={false}
          disabled={false}
          onChange={e => handleFortuneChange(e.target.value)}
          onBlur={e => handleFortuneChange(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 40,
              "& input": { padding: "8px 12px" },
              backgroundColor: "secondary.light",
            },
          }}
        />
        <Button
          size="small"
          variant="text"
          color="secondary"
          onClick={handleCancelFortuneDodge}
          sx={{
            minWidth: "auto",
            p: 0.5,
            height: 40,
          }}
          title="Cancel Fortune Dodge"
        >
          x
        </Button>
      </Box>
    </Box>
  )
}
