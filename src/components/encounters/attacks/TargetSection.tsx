"use client"

import {
  Box,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material"
import { CS } from "@/services"
import type { TargetSectionProps, Encounter } from "@/types"
import { NumberField } from "@/components/ui"
import CharacterSelector from "../CharacterSelector"
import { getDefenseModifiersText } from "./defenseModifierUtils"
import { CharacterHeader, Wounds, ActionValues } from "@/components/encounters"

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
        p: { xs: 1, sm: 1.5 },
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

      {/* Target Details with Defense Controls - Only show when non-mook attacker */}
      {selectedTargetIds.length > 0 && attacker && !CS.isMook(attacker) && (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Stack spacing={2}>
            {selectedTargetIds.map(targetId => {
              const shot = allShots.find(s => s.character?.shot_id === targetId)
              const target = shot?.character
              if (!target) return null

              return (
                <Box key={targetId}>
                  {/* All content in single paper background box */}
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "background.paper",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
                    >
                      {/* Character Display on the left - without its own paper box */}
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
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
                            <ActionValues character={target} />
                          </Box>
                        </Box>

                        {/* Dodge buttons integrated with character display */}
                        {!CS.isMook(target) && (
                          <Box sx={{ mt: 1.5 }}>
                            {defenseChoicePerTarget[targetId] !== "dodge" &&
                            defenseChoicePerTarget[targetId] !== "fortune" ? (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  // Calculate new defense with dodge bonus
                                  const baseDefense = CS.defense(target)
                                  const dodgeDefense = baseDefense + 3

                                  const newOverrides = {
                                    ...manualDefensePerTarget,
                                    [targetId]: dodgeDefense,
                                  }

                                  const newDefenseChoices = {
                                    ...defenseChoicePerTarget,
                                    [targetId]: "dodge",
                                  }

                                  updateFields({
                                    defenseChoicePerTarget: newDefenseChoices,
                                    manualDefensePerTarget: newOverrides,
                                  })

                                  // Recalculate defense immediately
                                  updateDefenseAndToughness(
                                    selectedTargetIds,
                                    stunt,
                                    newDefenseChoices,
                                    fortuneDiePerTarget,
                                    newOverrides
                                  )
                                }}
                                sx={{ minWidth: "80px" }}
                              >
                                Dodge
                              </Button>
                            ) : defenseChoicePerTarget[targetId] === "dodge" ? (
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    // Remove dodge choice and reset to base defense
                                    const newChoices = {
                                      ...defenseChoicePerTarget,
                                    }
                                    delete newChoices[targetId]

                                    const baseDefense = CS.defense(target)
                                    const newOverrides = {
                                      ...manualDefensePerTarget,
                                      [targetId]: baseDefense,
                                    }

                                    updateFields({
                                      defenseChoicePerTarget: newChoices,
                                      manualDefensePerTarget: newOverrides,
                                    })

                                    // Recalculate defense immediately
                                    updateDefenseAndToughness(
                                      selectedTargetIds,
                                      stunt,
                                      newChoices,
                                      fortuneDiePerTarget,
                                      newOverrides
                                    )
                                  }}
                                  sx={{ minWidth: "80px" }}
                                >
                                  ✓ Dodging
                                </Button>

                                {/* Fortune button for PCs - only shows when regular dodge is active */}
                                {CS.isPC(target) && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    color="secondary"
                                    onClick={() => {
                                      // Calculate defense with dodge bonus (fortune starts at 0)
                                      const baseDefense = CS.defense(target)
                                      const dodgeDefense = baseDefense + 3

                                      const newOverrides = {
                                        ...manualDefensePerTarget,
                                        [targetId]: dodgeDefense,
                                      }

                                      const newDefenseChoices = {
                                        ...defenseChoicePerTarget,
                                        [targetId]: "fortune",
                                      }

                                      const newFortuneDice = {
                                        ...fortuneDiePerTarget,
                                        [targetId]: "0",
                                      }

                                      updateFields({
                                        defenseChoicePerTarget:
                                          newDefenseChoices,
                                        fortuneDiePerTarget: newFortuneDice,
                                        manualDefensePerTarget: newOverrides,
                                      })

                                      // Recalculate defense immediately with the new values
                                      updateDefenseAndToughness(
                                        selectedTargetIds,
                                        stunt,
                                        newDefenseChoices,
                                        newFortuneDice,
                                        newOverrides
                                      )
                                    }}
                                    sx={{ minWidth: "40px", px: 1 }}
                                    title="Add Fortune to Dodge"
                                  >
                                    +🎲
                                  </Button>
                                )}
                              </Box>
                            ) : (
                              // Fortune dodge is active - show button and number field
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  gap: 1,
                                  alignItems: "flex-start",
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  color="secondary"
                                  onClick={() => {
                                    // Go back to regular dodge (remove fortune but keep dodge bonus)
                                    const newFortuneDice = {
                                      ...fortuneDiePerTarget,
                                    }
                                    delete newFortuneDice[targetId]

                                    const baseDefense = CS.defense(target)
                                    const dodgeDefense = baseDefense + 3
                                    const newOverrides = {
                                      ...manualDefensePerTarget,
                                      [targetId]: dodgeDefense,
                                    }

                                    const newDefenseChoices = {
                                      ...defenseChoicePerTarget,
                                      [targetId]: "dodge",
                                    }

                                    updateFields({
                                      defenseChoicePerTarget: newDefenseChoices,
                                      fortuneDiePerTarget: newFortuneDice,
                                      manualDefensePerTarget: newOverrides,
                                    })

                                    // Recalculate defense immediately with the new values
                                    updateDefenseAndToughness(
                                      selectedTargetIds,
                                      stunt,
                                      newDefenseChoices,
                                      newFortuneDice,
                                      newOverrides
                                    )
                                  }}
                                  sx={{ minWidth: "120px" }}
                                >
                                  ✓ Fortune Dodge
                                </Button>
                                <NumberField
                                  name={`fortuneDie-${targetId}`}
                                  value={
                                    parseInt(
                                      fortuneDiePerTarget[targetId] || "0"
                                    ) || 0
                                  }
                                  size="small"
                                  width="80px"
                                  error={false}
                                  disabled={false}
                                  onChange={e => {
                                    const fortuneValue =
                                      parseInt(e.target.value) || 0
                                    const newFortuneDice = {
                                      ...fortuneDiePerTarget,
                                      [targetId]: e.target.value,
                                    }

                                    // Update defense with dodge + fortune
                                    const baseDefense = CS.defense(target)
                                    const totalDefense =
                                      baseDefense + 3 + fortuneValue
                                    const newOverrides = {
                                      ...manualDefensePerTarget,
                                      [targetId]: totalDefense,
                                    }

                                    updateFields({
                                      fortuneDiePerTarget: newFortuneDice,
                                      manualDefensePerTarget: newOverrides,
                                    })

                                    // Recalculate defense immediately with the new values
                                    updateDefenseAndToughness(
                                      selectedTargetIds,
                                      stunt,
                                      defenseChoicePerTarget,
                                      newFortuneDice,
                                      newOverrides
                                    )
                                  }}
                                  onBlur={e => {
                                    const fortuneValue =
                                      parseInt(e.target.value) || 0
                                    const newFortuneDice = {
                                      ...fortuneDiePerTarget,
                                      [targetId]: e.target.value,
                                    }

                                    // Update defense with dodge + fortune
                                    const baseDefense = CS.defense(target)
                                    const totalDefense =
                                      baseDefense + 3 + fortuneValue
                                    const newOverrides = {
                                      ...manualDefensePerTarget,
                                      [targetId]: totalDefense,
                                    }

                                    updateFields({
                                      fortuneDiePerTarget: newFortuneDice,
                                      manualDefensePerTarget: newOverrides,
                                    })

                                    // Recalculate defense immediately with the new values
                                    updateDefenseAndToughness(
                                      selectedTargetIds,
                                      stunt,
                                      defenseChoicePerTarget,
                                      newFortuneDice,
                                      newOverrides
                                    )
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Defense/Toughness Controls on the right */}
                      <Box sx={{ flexShrink: 0 }}>
                        <Stack spacing={1}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ mb: 0.5, display: "block" }}
                            >
                              Defense
                            </Typography>
                            <NumberField
                              name={`defense-${targetId}`}
                              value={
                                manualDefensePerTarget[targetId] ??
                                CS.defense(target)
                              }
                              size="small"
                              width="80px"
                              error={false}
                              onChange={e => {
                                const newVal = parseInt(e.target.value) || 0
                                updateField("manualDefensePerTarget", {
                                  ...manualDefensePerTarget,
                                  [targetId]: newVal,
                                })
                              }}
                              onBlur={e => {
                                const newVal = parseInt(e.target.value) || 0
                                updateField("manualDefensePerTarget", {
                                  ...manualDefensePerTarget,
                                  [targetId]: newVal,
                                })
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ mb: 0.5, display: "block" }}
                            >
                              Toughness
                            </Typography>
                            <NumberField
                              name={`toughness-${targetId}`}
                              value={
                                manualToughnessPerTarget[targetId] ??
                                CS.toughness(target)
                              }
                              size="small"
                              width="80px"
                              error={false}
                              onChange={e => {
                                const newVal = parseInt(e.target.value) || 0
                                updateField("manualToughnessPerTarget", {
                                  ...manualToughnessPerTarget,
                                  [targetId]: newVal,
                                })
                              }}
                              onBlur={e => {
                                const newVal = parseInt(e.target.value) || 0
                                updateField("manualToughnessPerTarget", {
                                  ...manualToughnessPerTarget,
                                  [targetId]: newVal,
                                })
                              }}
                            />
                          </Box>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )
            })}
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
