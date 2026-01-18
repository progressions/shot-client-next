"use client"

import { Box, Typography, Stack } from "@mui/material"
import { CS } from "@/services"
import type { TargetSectionProps, Encounter, DefenseChoice } from "@/types"
import CharacterSelector from "../CharacterSelector"
import MookDistribution from "./MookDistribution"
import TargetCard from "./TargetCard"
import DefenseModifiers from "./DefenseModifiers"
import { getTargetCharacterTypes } from "./targetSectionUtils"

/**
 * TargetSection component
 *
 * Main component for selecting and managing attack targets.
 * Handles:
 * - Target selection via CharacterSelector
 * - Mook distribution when attacker is a mook
 * - Target cards with defense/toughness controls
 * - Defense modifiers and stunt checkbox
 */
export default function TargetSection({
  allShots,
  sortedTargetShots,
  formState,
  attacker,
  attackerShotId,
  updateField,
  updateFields,
  updateDefenseAndToughness,
  distributeMooks,
  calculateTargetDefense,
  encounter,
}: TargetSectionProps & { encounter: Encounter }) {
  // Extract needed values from formState
  const {
    selectedTargetIds,
    stunt,
    targetMookCountPerTarget,
    mookDistribution,
    totalAttackingMooks,
    defenseChoicePerTarget,
    fortuneDiePerTarget,
    manualDefensePerTarget,
    manualToughnessPerTarget,
    defenseValue,
  } = formState.data

  // Check if all selected targets are mooks
  const allTargetsAreMooks = selectedTargetIds.every(id => {
    const shot = allShots.find(s => s.character?.shot_id === id)
    return shot?.character && CS.isMook(shot.character)
  })

  // Handle target selection/deselection
  const handleTargetSelect = (shotId: string) => {
    if (selectedTargetIds.includes(shotId)) {
      handleTargetDeselect(shotId)
    } else {
      handleTargetAdd(shotId)
    }
  }

  // Handle adding a target
  const handleTargetAdd = (shotId: string) => {
    const newIds = [...selectedTargetIds, shotId]
    updateField("selectedTargetIds", newIds)

    // Initialize mook count for newly selected mook
    const selectedShot = allShots.find(s => s.character?.shot_id === shotId)
    if (selectedShot?.character && CS.isMook(selectedShot.character)) {
      updateField("targetMookCountPerTarget", {
        ...targetMookCountPerTarget,
        [shotId]: 1, // Initialize with count of 1
      })
    }

    updateDefenseAndToughness(newIds, stunt)

    // Update mook distribution
    if (attacker && CS.isMook(attacker)) {
      distributeMooks(newIds)
    }
  }

  // Handle removing a target
  const handleTargetDeselect = (shotId: string) => {
    const newIds = selectedTargetIds.filter(id => id !== shotId)
    updateField("selectedTargetIds", newIds)

    // Reset the mook count for the deselected target
    const deselectedShot = allShots.find(s => s.character?.shot_id === shotId)
    if (deselectedShot?.character && CS.isMook(deselectedShot.character)) {
      const newTargetMookCountPerTarget = {
        ...targetMookCountPerTarget,
      }
      delete newTargetMookCountPerTarget[shotId]
      updateField("targetMookCountPerTarget", newTargetMookCountPerTarget)
    }

    // Update defense/toughness based on remaining targets
    if (newIds.length === 0) {
      updateFields({
        defenseValue: "0",
        toughnessValue: "0",
      })
    } else {
      updateDefenseAndToughness(newIds, stunt)
    }

    // Update mook distribution
    if (attacker && CS.isMook(attacker)) {
      distributeMooks(newIds)
    }
  }

  // Get character types to show based on attacker
  const characterTypes = getTargetCharacterTypes(
    attacker,
    CS.isPC,
    CS.isAlly,
    CS.isMook,
    CS.isFeaturedFoe,
    CS.isBoss,
    CS.isUberBoss
  )

  const isMookAttacker = attacker && CS.isMook(attacker)

  return (
    <Box sx={{ p: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, fontWeight: "bold", color: "text.secondary" }}
      >
        TARGET{selectedTargetIds.length > 1 ? "S" : ""}{" "}
        {selectedTargetIds.length > 0 && `(${selectedTargetIds.length})`}
      </Typography>

      {/* Compact Target Selection */}
      <CharacterSelector
        shots={sortedTargetShots}
        selectedShotIds={selectedTargetIds}
        showShotNumbers={false}
        size="small"
        onSelect={handleTargetSelect}
        borderColor="error.main"
        disabled={!attackerShotId}
        excludeShotId={attackerShotId}
        multiSelect={true}
        showAllCheckbox={true}
        characterTypes={characterTypes}
      />

      {/* Mook Distribution Display */}
      {isMookAttacker && selectedTargetIds.length > 0 && (
        <MookDistribution
          allShots={allShots}
          selectedTargetIds={selectedTargetIds}
          mookDistribution={mookDistribution}
          totalAttackingMooks={totalAttackingMooks}
          attacker={attacker}
          stunt={stunt}
          defenseChoicePerTarget={defenseChoicePerTarget}
          fortuneDiePerTarget={fortuneDiePerTarget}
          encounter={encounter}
          updateField={updateField}
        />
      )}

      {/* Target Details with Defense Controls - Only show when non-mook attacker */}
      {selectedTargetIds.length > 0 && attacker && !isMookAttacker && (
        <Box sx={{ mt: 1, mb: 1 }}>
          <Stack spacing={1}>
            {selectedTargetIds.map(targetId => {
              const shot = allShots.find(s => s.character?.shot_id === targetId)
              const target = shot?.character
              if (!target) return null

              return (
                <TargetCard
                  key={targetId}
                  targetId={targetId}
                  target={target}
                  stunt={stunt}
                  targetMookCountPerTarget={targetMookCountPerTarget}
                  defenseChoicePerTarget={defenseChoicePerTarget}
                  fortuneDiePerTarget={fortuneDiePerTarget}
                  manualDefensePerTarget={
                    manualDefensePerTarget as unknown as {
                      [targetId: string]: number
                    }
                  }
                  manualToughnessPerTarget={
                    manualToughnessPerTarget as unknown as {
                      [targetId: string]: number
                    }
                  }
                  selectedTargetIds={selectedTargetIds}
                  attacker={attacker}
                  encounter={encounter}
                  calculateTargetDefense={calculateTargetDefense}
                  updateField={updateField}
                  updateFields={updateFields}
                  updateDefenseAndToughness={
                    updateDefenseAndToughness as (
                      targetIds: string[],
                      includeStunt: boolean,
                      defenseChoices?: { [targetId: string]: DefenseChoice },
                      fortuneDice?: { [targetId: string]: string },
                      manualDefense?: { [targetId: string]: number }
                    ) => void
                  }
                />
              )
            })}
          </Stack>
        </Box>
      )}

      {/* Defense and Modifiers Section */}
      <DefenseModifiers
        allShots={allShots}
        selectedTargetIds={selectedTargetIds}
        attacker={attacker}
        stunt={stunt}
        defenseValue={defenseValue}
        manualDefensePerTarget={
          manualDefensePerTarget as unknown as { [targetId: string]: number }
        }
        allTargetsAreMooks={allTargetsAreMooks}
        updateField={updateField}
        updateDefenseAndToughness={
          updateDefenseAndToughness as (
            targetIds: string[],
            includeStunt: boolean,
            defenseChoices?: { [targetId: string]: DefenseChoice },
            fortuneDice?: { [targetId: string]: string },
            manualDefense?: { [targetId: string]: number }
          ) => void
        }
      />
    </Box>
  )
}
