"use client"

import {
  Box,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material"
import { CS } from "@/services"
import type { TargetSectionProps, Encounter } from "@/types"
import { NumberField } from "@/components/ui"
import CharacterSelector from "../CharacterSelector"
import TargetDefenseDisplay from "./TargetDefenseDisplay"
import { getDefenseModifiersText } from "./defenseModifierUtils"

// Helper function to handle mook distribution updates
const updateMookDistribution = (
  targetId: string,
  newValue: number,
  selectedTargetIds: string[],
  mookDistribution: { [targetId: string]: number },
  totalMooksAvailable: number,
  updateField: (name: string, value: unknown) => void
) => {
  const validValue = Math.max(0, newValue)

  // If there are exactly 2 targets, auto-adjust the other one
  if (selectedTargetIds.length === 2) {
    const otherId = selectedTargetIds.find(tid => tid !== targetId)
    if (!otherId) return

    // Ensure we don't exceed total mooks
    const finalValue = Math.min(validValue, totalMooksAvailable)
    const remainingMooks = Math.max(0, totalMooksAvailable - finalValue)

    updateField("mookDistribution", {
      [targetId]: finalValue,
      [otherId]: remainingMooks,
    })
    updateField("totalAttackingMooks", totalMooksAvailable)
  } else {
    // For more than 2 targets, just update this one
    const otherTargetIds = selectedTargetIds.filter(tid => tid !== targetId)
    const otherMooks = otherTargetIds.reduce(
      (sum, tid) => sum + (mookDistribution[tid] || 0),
      0
    )

    // Ensure we don't exceed total mooks
    const maxForThisTarget = totalMooksAvailable - otherMooks
    const finalValue = Math.min(validValue, maxForThisTarget)

    const newDistribution = {
      ...mookDistribution,
      [targetId]: finalValue,
    }
    const newTotal = Object.values(newDistribution).reduce(
      (sum, val) => sum + val,
      0
    )

    updateField("mookDistribution", newDistribution)
    updateField("totalAttackingMooks", newTotal)
  }
}

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
    targetMookCount,
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

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: "2px solid",
        borderBottomColor: "divider",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2, color: "error.main" }}>
        🎯 Target{selectedTargetIds.length > 1 ? "s" : ""}{" "}
        {selectedTargetIds.length > 0 && `(${selectedTargetIds.length})`}
      </Typography>

      {/* Multi-select Target Selection */}
      <CharacterSelector
        shots={sortedTargetShots}
        selectedShotIds={selectedTargetIds}
        showShotNumbers={false}
        onSelect={shotId => {
          if (selectedTargetIds.includes(shotId)) {
            // Deselect if already selected
            const newIds = selectedTargetIds.filter(id => id !== shotId)
            updateField("selectedTargetIds", newIds)

            // Reset the mook count for the deselected target
            const deselectedShot = allShots.find(
              s => s.character?.shot_id === shotId
            )
            if (
              deselectedShot?.character &&
              CS.isMook(deselectedShot.character)
            ) {
              // Remove the count for this specific mook
              const newTargetMookCountPerTarget = {
                ...targetMookCountPerTarget,
              }
              delete newTargetMookCountPerTarget[shotId]
              updateField(
                "targetMookCountPerTarget",
                newTargetMookCountPerTarget
              )
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
            if (CS.isMook(attacker)) {
              distributeMooks(newIds)
            }
          } else {
            // Add to selection
            const newIds = [...selectedTargetIds, shotId]
            updateField("selectedTargetIds", newIds)

            // Initialize mook count for newly selected mook
            const selectedShot = allShots.find(
              s => s.character?.shot_id === shotId
            )
            if (selectedShot?.character && CS.isMook(selectedShot.character)) {
              updateField("targetMookCountPerTarget", {
                ...targetMookCountPerTarget,
                [shotId]: 1, // Initialize with count of 1
              })
            }

            updateDefenseAndToughness(newIds, stunt)

            // Update mook distribution
            if (CS.isMook(attacker)) {
              distributeMooks(newIds)
            }
          }
        }}
        borderColor="error.main"
        disabled={!attackerShotId}
        excludeShotId={attackerShotId}
        multiSelect={true}
        showAllCheckbox={true}
        characterTypes={(() => {
          if (!attacker) return undefined

          // If attacker is PC or Ally, show enemies
          if (CS.isPC(attacker) || CS.isAlly(attacker)) {
            return ["Uber-Boss", "Boss", "Featured Foe", "Mook"]
          }
          
          // If attacker is enemy, show PCs and Allies
          if (
            CS.isMook(attacker) ||
            CS.isFeaturedFoe(attacker) ||
            CS.isBoss(attacker) ||
            CS.isUberBoss(attacker)
          ) {
            return ["PC", "Ally"]
          }
          
          return undefined
        })()}
      />

      {/* Mook Distribution Display */}
      {CS.isMook(attacker) && selectedTargetIds.length > 0 && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: "medium" }}>
            Mook Distribution ({totalAttackingMooks} total)
          </Typography>
          <Stack spacing={1}>
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
                    gap: 2,
                    backgroundColor: "background.paper",
                    p: 1,
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
      )}

      {/* Target Defense Display - Only show when non-mook attacker (mook attackers have distribution display above) */}
      {selectedTargetIds.length > 0 && attacker && !CS.isMook(attacker) && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Stack spacing={1}>
            {selectedTargetIds.map(targetId => (
              <TargetDefenseDisplay
                key={targetId}
                targetId={targetId}
                allShots={allShots}
                attacker={attacker}
                stunt={stunt}
                targetMookCount={targetMookCount}
                targetMookCountPerTarget={targetMookCountPerTarget}
                defenseChoicePerTarget={defenseChoicePerTarget}
                fortuneDiePerTarget={fortuneDiePerTarget}
                manualDefensePerTarget={manualDefensePerTarget}
                manualToughnessPerTarget={manualToughnessPerTarget}
                selectedTargetIds={selectedTargetIds}
                calculateTargetDefense={calculateTargetDefense}
                updateField={updateField}
                updateFields={updateFields}
                updateDefenseAndToughness={updateDefenseAndToughness}
                encounter={encounter}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Defense and Modifiers Section */}
      <Box sx={{ mb: 3, mt: 2 }}>
        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 4 }}
          alignItems="flex-start"
        >
          {/* Defense Value - show for multiple targets when non-mook attacker (except for single mook group) */}
          {selectedTargetIds.length > 1 && attacker && !CS.isMook(attacker) && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                Defense
              </Typography>
              <NumberField
                name="defenseValue"
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
              {(() => {
                let total = 0
                if (stunt) total += 2
                return total > 0 ? (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      fontStyle: "italic",
                      color: "text.secondary",
                    }}
                  >
                    +{total} modifiers
                  </Typography>
                ) : null
              })()}
            </Box>
          )}

          {/* Stunt Checkbox */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={stunt}
                  onChange={e => {
                    updateField("stunt", e.target.checked)
                    // When stunt changes, recalculate defense for all targets
                    if (selectedTargetIds.length > 0) {
                      updateDefenseAndToughness(
                        selectedTargetIds,
                        e.target.checked
                      )
                    }
                  }}
                />
              }
              label="Stunt (+2 Defense)"
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
