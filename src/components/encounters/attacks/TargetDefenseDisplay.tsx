"use client"

import { Box, Typography, Button } from "@mui/material"
import { NumberField } from "@/components/ui"
import { CS, CharacterEffectService } from "@/services"
import type {
  Character,
  Shot,
  DefenseChoice,
  TargetDefenseDisplayProps,
  Encounter,
} from "@/types"
import { getDefenseModifiersText } from "./defenseModifierUtils"

// Helper function to recalculate combined defense for multiple targets
const recalculateCombinedDefense = (
  selectedTargetIds: string[],
  currentTargetId: string,
  currentTargetDefense: number,
  allShots: Shot[],
  calculateTargetDefense: (target: Character, targetId: string) => number,
  manualDefensePerTarget: { [targetId: string]: string },
  updateField: (name: string, value: unknown) => void
): void => {
  if (selectedTargetIds.length > 1) {
    const updatedDefenses = selectedTargetIds.map(tid => {
      if (tid === currentTargetId) {
        return currentTargetDefense
      }
      const targetShot = allShots.find(s => s.character?.shot_id === tid)
      const targetChar = targetShot?.character
      if (!targetChar) return 0
      return manualDefensePerTarget[tid]
        ? parseInt(manualDefensePerTarget[tid])
        : calculateTargetDefense(targetChar, tid)
    })
    const highestDefense = Math.max(...updatedDefenses)
    const combinedDefense = highestDefense + selectedTargetIds.length
    updateField("defenseValue", combinedDefense.toString())
  } else {
    updateField("defenseValue", currentTargetDefense.toString())
  }
}

export default function TargetDefenseDisplay({
  targetId,
  allShots,
  attacker,
  stunt,
  targetMookCount,
  targetMookCountPerTarget,
  defenseChoicePerTarget,
  fortuneDiePerTarget,
  manualDefensePerTarget,
  manualToughnessPerTarget,
  selectedTargetIds,
  calculateTargetDefense,
  updateField,
  updateFields,
  updateDefenseAndToughness,
  encounter,
}: TargetDefenseDisplayProps & { encounter: Encounter }) {
  const shot = allShots.find(s => s.character?.shot_id === targetId)
  const char = shot?.character
  if (!char) return null

  const baseDefense = CS.defense(char)
  // For mooks, calculate defense including the count
  const mookCount = CS.isMook(char)
    ? targetMookCountPerTarget[targetId] || 1
    : 1
  const defenseWithMookCount =
    CS.isMook(char) && mookCount > 1 ? baseDefense + mookCount : baseDefense
  const currentDefense = manualDefensePerTarget[targetId]
    ? parseInt(manualDefensePerTarget[targetId])
    : defenseWithMookCount + (stunt ? 2 : 0)
  const baseToughness = CS.toughness(char)
  const currentToughness = manualToughnessPerTarget[targetId]
    ? parseInt(manualToughnessPerTarget[targetId])
    : baseToughness

  // For mook attackers, show a simpler display without dodge buttons and fields
  if (CS.isMook(attacker)) {
    const modifiersText = getDefenseModifiersText(
      char,
      stunt,
      defenseChoicePerTarget[targetId],
      fortuneDiePerTarget[targetId],
      encounter,
      "Defense"
    )

    // Don't show anything if there are no modifiers
    if (!modifiersText) return null

    return (
      <Box
        sx={{
          backgroundColor: "background.paper",
          p: 1.5,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
          {char.name}
        </Typography>
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
      </Box>
    )
  }

  // For non-mook attackers, show the full defense display
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        gap: { xs: 1, sm: 2 },
        backgroundColor: "background.paper",
        p: 1,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Name at the top for mobile */}
      <Box sx={{ display: { xs: "block", sm: "none" }, mb: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: "medium",
          }}
        >
          {char.name}
        </Typography>
        {/* Defense modifiers text */}
        {(stunt ||
          (defenseChoicePerTarget[targetId] &&
            defenseChoicePerTarget[targetId] !== "none") ||
          char.impairments > 0) && (
          <Typography
            variant="caption"
            sx={{
              fontStyle: "italic",
              color: "text.secondary",
              display: "block",
            }}
          >
            {getDefenseModifiersText(
              char,
              stunt,
              defenseChoicePerTarget[targetId],
              fortuneDiePerTarget[targetId],
              encounter,
              "Defense"
            )}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {/* Count field for mooks when non-mook is attacking */}
        {CS.isMook(char) && !CS.isMook(attacker) && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "80px",
            }}
          >
            <NumberField
              name={`count-${targetId}`}
              value={targetMookCountPerTarget[targetId] || 1}
              size="small"
              width="80px"
              error={false}
              disabled={false}
              onChange={e => {
                const count = Math.max(1, parseInt(e.target.value) || 1)
                // Update the per-target mook count
                updateField("targetMookCountPerTarget", {
                  ...targetMookCountPerTarget,
                  [targetId]: count,
                })

                // Update the manual defense for this mook group
                const baseDefense = CS.defense(char)
                const newDefense = count > 1 ? baseDefense + count : baseDefense
                const finalDefense = newDefense + (stunt ? 2 : 0)
                updateField("manualDefensePerTarget", {
                  ...manualDefensePerTarget,
                  [targetId]: finalDefense.toString(),
                })

                // For backward compatibility, update single targetMookCount if only one target
                if (selectedTargetIds.length === 1) {
                  updateField("targetMookCount", count)
                  updateField("defenseValue", finalDefense.toString())
                }
              }}
              onBlur={e => {
                const count = Math.max(1, parseInt(e.target.value) || 1)
                // Update the per-target mook count
                updateField("targetMookCountPerTarget", {
                  ...targetMookCountPerTarget,
                  [targetId]: count,
                })

                // Update the manual defense for this mook group
                const baseDefense = CS.defense(char)
                const newDefense = count > 1 ? baseDefense + count : baseDefense
                const finalDefense = newDefense + (stunt ? 2 : 0)
                updateField("manualDefensePerTarget", {
                  ...manualDefensePerTarget,
                  [targetId]: finalDefense.toString(),
                })

                // For backward compatibility, update single targetMookCount if only one target
                if (selectedTargetIds.length === 1) {
                  updateField("targetMookCount", count)
                  updateField("defenseValue", finalDefense.toString())
                }
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              Count
            </Typography>
            {/* Reserve space for consistency */}
            <Box sx={{ height: "20px", mt: 0.25 }} />
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "80px",
          }}
        >
          <NumberField
            name={`defense-${targetId}`}
            value={manualDefensePerTarget[targetId] || currentDefense}
            size="small"
            width="80px"
            error={false}
            disabled={false}
            onChange={e => {
              updateField("manualDefensePerTarget", {
                ...manualDefensePerTarget,
                [targetId]: e.target.value,
              })
              // Recalculate combined defense for multiple targets
              recalculateCombinedDefense(
                selectedTargetIds,
                targetId,
                parseInt(e.target.value) || 0,
                allShots,
                calculateTargetDefense,
                manualDefensePerTarget,
                updateField
              )
            }}
            onBlur={e => {
              updateField("manualDefensePerTarget", {
                ...manualDefensePerTarget,
                [targetId]: e.target.value,
              })
            }}
          />
          <Typography variant="caption" sx={{ mt: 0.5 }}>
            Defense
          </Typography>
          {/* Defense total change - always reserve space */}
          <Box sx={{ height: "20px", mt: 0.25 }}>
            {(() => {
              // Get the total change from effects and impairments
              if (encounter) {
                const baseValue = CS.rawActionValue(char, "Defense")
                const [totalChange] = CharacterEffectService.adjustedValue(
                  char,
                  baseValue,
                  "Defense",
                  encounter,
                  false // don't ignore impairments - this will include both effects and impairments
                )
                
                if (totalChange !== 0) {
                  return (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: totalChange > 0 ? "success.main" : "error.main",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {totalChange > 0 ? "+" : ""}{totalChange}
                    </Typography>
                  )
                }
              } else if (char.impairments > 0) {
                // No encounter, but show impairments
                return (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "error.main",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    -{char.impairments}
                  </Typography>
                )
              }
              return null
            })()}
          </Box>
        </Box>
        {/* Only show Toughness for non-mooks */}
        {!CS.isMook(char) && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minWidth: "80px",
            }}
          >
            <NumberField
              name={`toughness-${targetId}`}
              value={manualToughnessPerTarget[targetId] || currentToughness}
              size="small"
              width="80px"
              error={false}
              disabled={false}
              onChange={e => {
                updateField("manualToughnessPerTarget", {
                  ...manualToughnessPerTarget,
                  [targetId]: e.target.value,
                })
              }}
              onBlur={e => {
                updateField("manualToughnessPerTarget", {
                  ...manualToughnessPerTarget,
                  [targetId]: e.target.value,
                })
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              Toughness
            </Typography>
            {/* Toughness total change - always reserve space */}
            <Box sx={{ height: "20px", mt: 0.25 }}>
              {(() => {
                if (encounter) {
                  const baseValue = CS.toughness(char)
                  const [effectChange] = CharacterEffectService.adjustedValue(
                    char,
                    baseValue,
                    "Toughness",
                    encounter,
                    true // ignore impairments for Toughness
                  )
                  
                  if (effectChange !== 0) {
                    return (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: effectChange > 0 ? "success.main" : "error.main",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {effectChange > 0 ? "+" : ""}{effectChange}
                      </Typography>
                    )
                  }
                }
                return null
              })()}
            </Box>
          </Box>
        )}
      </Box>

      {/* Name on the side for desktop */}
      <Box sx={{ flex: 1, display: { xs: "none", sm: "block" }, alignSelf: "flex-start" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: "medium",
          }}
        >
          {char.name}
        </Typography>
        {/* Defense modifiers text */}
        {(stunt ||
          (defenseChoicePerTarget[targetId] &&
            defenseChoicePerTarget[targetId] !== "none") ||
          char.impairments > 0) && (
          <Typography
            variant="caption"
            sx={{
              fontStyle: "italic",
              color: "text.secondary",
              display: "block",
            }}
          >
            {getDefenseModifiersText(
              char,
              stunt,
              defenseChoicePerTarget[targetId],
              fortuneDiePerTarget[targetId],
              encounter,
              "Defense"
            )}
          </Typography>
        )}
      </Box>

      {/* Dodge buttons - not shown for Mook targets */}
      <Box sx={{ alignSelf: "flex-start" }}>
        {!CS.isMook(char) &&
        (defenseChoicePerTarget[targetId] !== "dodge" &&
        defenseChoicePerTarget[targetId] !== "fortune" ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // Just set the dodge choice, don't apply it yet
              updateField("defenseChoicePerTarget", {
                ...defenseChoicePerTarget,
                [targetId]: "dodge" as DefenseChoice,
              })
              // Clear any manual defense override so calculateTargetDefense takes over
              const newOverrides = { ...manualDefensePerTarget }
              delete newOverrides[targetId]
              updateField("manualDefensePerTarget", newOverrides)
              // Recalculate combined defense
              if (selectedTargetIds.length > 1) {
                const updatedDefenses = selectedTargetIds.map(tid => {
                  const targetShot = allShots.find(
                    s => s.character?.shot_id === tid
                  )
                  const targetChar = targetShot?.character
                  if (!targetChar) return 0

                  // Use calculateTargetDefense which will include dodge for this target
                  if (tid === targetId) {
                    return CS.defense(targetChar) + 3 + (stunt ? 2 : 0) // dodge + stunt
                  }
                  return calculateTargetDefense(targetChar, tid)
                })
                const highestDefense = Math.max(...updatedDefenses)
                const combinedDefense =
                  highestDefense + selectedTargetIds.length
                updateField("defenseValue", combinedDefense.toString())
              } else {
                // Single target - just update defense
                const targetShot = allShots.find(
                  s => s.character?.shot_id === targetId
                )
                const targetChar = targetShot?.character
                if (targetChar) {
                  const newDefense =
                    CS.defense(targetChar) + 3 + (stunt ? 2 : 0)
                  updateField("defenseValue", newDefense.toString())
                }
              }
            }}
            sx={{ minWidth: "80px" }}
          >
            Dodge
          </Button>
        ) : defenseChoicePerTarget[targetId] === "dodge" ? (
          <>
            <Button
              variant="contained"
              size="small"
              color="success"
              onClick={() => {
                // Remove dodge choice
                const newChoices = { ...defenseChoicePerTarget }
                delete newChoices[targetId]
                updateField("defenseChoicePerTarget", newChoices)
                // Recalculate defense without dodge
                if (selectedTargetIds.length > 0) {
                  updateDefenseAndToughness(selectedTargetIds, stunt)
                }
              }}
              sx={{ minWidth: "80px" }}
            >
              ✓ Dodging
            </Button>

            {/* Fortune button for PCs - only shows when regular dodge is active */}
            {CS.isPC(char) && (
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => {
                  // Upgrade to fortune defense choice
                  updateField("defenseChoicePerTarget", {
                    ...defenseChoicePerTarget,
                    [targetId]: "fortune" as DefenseChoice,
                  })
                  // Initialize fortune die to 0
                  updateField("fortuneDiePerTarget", {
                    ...fortuneDiePerTarget,
                    [targetId]: "0",
                  })
                }}
                sx={{ minWidth: "40px", px: 1 }}
                title="Add Fortune to Dodge"
              >
                +🎲
              </Button>
            )}
          </>
        ) : (
          // Fortune dodge is active - show button and number field
          <>
            <Button
              variant="contained"
              size="small"
              color="secondary"
              onClick={() => {
                // Go back to regular dodge
                updateField("defenseChoicePerTarget", {
                  ...defenseChoicePerTarget,
                  [targetId]: "dodge" as DefenseChoice,
                })
                // Clear fortune die
                const newFortuneDice = { ...fortuneDiePerTarget }
                delete newFortuneDice[targetId]
                updateField("fortuneDiePerTarget", newFortuneDice)
                // Recalculate defense for regular dodge
                if (selectedTargetIds.length > 1) {
                  const updatedDefenses = selectedTargetIds.map(tid => {
                    const targetShot = allShots.find(
                      s => s.character?.shot_id === tid
                    )
                    const targetChar = targetShot?.character
                    if (!targetChar) return 0

                    if (tid === targetId) {
                      return CS.defense(targetChar) + 3 + (stunt ? 2 : 0) // back to regular dodge
                    }
                    return calculateTargetDefense(targetChar, tid)
                  })
                  const highestDefense = Math.max(...updatedDefenses)
                  const combinedDefense =
                    highestDefense + selectedTargetIds.length
                  updateField("defenseValue", combinedDefense.toString())
                } else {
                  // Single target
                  const targetShot = allShots.find(
                    s => s.character?.shot_id === targetId
                  )
                  const targetChar = targetShot?.character
                  if (targetChar) {
                    const newDefense =
                      CS.defense(targetChar) + 3 + (stunt ? 2 : 0)
                    updateField("defenseValue", newDefense.toString())
                  }
                }
              }}
              sx={{ minWidth: "120px" }}
            >
              ✓ Fortune Dodge
            </Button>
            <NumberField
              name={`fortuneDie-${targetId}`}
              value={parseInt(fortuneDiePerTarget[targetId] || "0") || 0}
              size="small"
              width="80px"
              error={false}
              disabled={false}
              onChange={e => {
                updateField("fortuneDiePerTarget", {
                  ...fortuneDiePerTarget,
                  [targetId]: e.target.value,
                })
                // Recalculate defense with new fortune value
                if (selectedTargetIds.length > 1) {
                  const updatedDefenses = selectedTargetIds.map(tid => {
                    const targetShot = allShots.find(
                      s => s.character?.shot_id === tid
                    )
                    const targetChar = targetShot?.character
                    if (!targetChar) return 0

                    if (tid === targetId) {
                      return (
                        CS.defense(targetChar) +
                        3 +
                        parseInt(e.target.value || "0") +
                        (stunt ? 2 : 0)
                      )
                    }
                    return calculateTargetDefense(targetChar, tid)
                  })
                  const highestDefense = Math.max(...updatedDefenses)
                  const combinedDefense =
                    highestDefense + selectedTargetIds.length
                  updateField("defenseValue", combinedDefense.toString())
                } else {
                  // Single target
                  const targetShot = allShots.find(
                    s => s.character?.shot_id === targetId
                  )
                  const targetChar = targetShot?.character
                  if (targetChar) {
                    const newDefense =
                      CS.defense(targetChar) +
                      3 +
                      parseInt(e.target.value || "0") +
                      (stunt ? 2 : 0)
                    updateField("defenseValue", newDefense.toString())
                  }
                }
              }}
              onBlur={e => {
                updateField("fortuneDiePerTarget", {
                  ...fortuneDiePerTarget,
                  [targetId]: e.target.value,
                })
              }}
            />
          </>
        ))}
      </Box>
    </Box>
  )
}
