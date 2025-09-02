"use client"

import { Box, Typography, Button } from "@mui/material"
import { NumberField } from "@/components/ui"
import CharacterLink from "@/components/ui/links/CharacterLink"
import { CS, CES } from "@/services"
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
  // Calculate the actual current defense using the same function used everywhere else
  const currentDefense = manualDefensePerTarget[targetId]
    ? parseInt(manualDefensePerTarget[targetId])
    : calculateTargetDefense(char, targetId)
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
        <CharacterLink character={char}>{char.name}</CharacterLink>
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
        <CharacterLink character={char}>{char.name}</CharacterLink>
        {/* Defense modifiers text */}
        {(() => {
          const modifiersText = getDefenseModifiersText(
            char,
            stunt,
            defenseChoicePerTarget[targetId],
            fortuneDiePerTarget[targetId],
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
              let totalChange = 0

              // Add stunt bonus
              if (stunt) {
                totalChange += 2
              }

              // Add dodge/fortune bonus
              if (defenseChoicePerTarget[targetId] === "dodge") {
                totalChange += 3
              } else if (defenseChoicePerTarget[targetId] === "fortune") {
                const fortuneValue = parseInt(
                  fortuneDiePerTarget[targetId] || "0"
                )
                totalChange += 3 + fortuneValue
              }

              // Add effects and impairments
              if (encounter) {
                const baseValue = CS.rawActionValue(char, "Defense")
                const [effectsAndImpairments] =
                  CES.adjustedValue(
                    char,
                    baseValue,
                    "Defense",
                    encounter,
                    false // don't ignore impairments - this will include both effects and impairments
                  )
                totalChange += effectsAndImpairments
              } else if (char.impairments > 0) {
                // No encounter, but subtract impairments
                totalChange -= char.impairments
              }

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
                    {totalChange > 0 ? "+" : ""}
                    {totalChange}
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
                  const [effectChange] = CES.adjustedValue(
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
                          color:
                            effectChange > 0 ? "success.main" : "error.main",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        {effectChange > 0 ? "+" : ""}
                        {effectChange}
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
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", sm: "block" },
          alignSelf: "flex-start",
        }}
      >
        <CharacterLink character={char}>{char.name}</CharacterLink>
        {/* Defense modifiers text */}
        {(() => {
          const modifiersText = getDefenseModifiersText(
            char,
            stunt,
            defenseChoicePerTarget[targetId],
            fortuneDiePerTarget[targetId],
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

      {/* Dodge buttons - not shown for Mook targets */}
      <Box sx={{ alignSelf: "flex-start" }}>
        {!CS.isMook(char) &&
          (defenseChoicePerTarget[targetId] !== "dodge" &&
          defenseChoicePerTarget[targetId] !== "fortune" ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                // Update the dodge choice and clear manual override in one batch
                const newOverrides = { ...manualDefensePerTarget }
                delete newOverrides[targetId]

                const newDefenseChoices = {
                  ...defenseChoicePerTarget,
                  [targetId]: "dodge" as DefenseChoice,
                }

                updateFields({
                  defenseChoicePerTarget: newDefenseChoices,
                  manualDefensePerTarget: newOverrides,
                })

                // Recalculate defense immediately with the new values
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
                  // Remove dodge choice and clear manual override
                  const newChoices = { ...defenseChoicePerTarget }
                  delete newChoices[targetId]

                  const newOverrides = { ...manualDefensePerTarget }
                  delete newOverrides[targetId]

                  updateFields({
                    defenseChoicePerTarget: newChoices,
                    manualDefensePerTarget: newOverrides,
                  })

                  // Recalculate defense immediately with the new values
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
              {CS.isPC(char) && (
                <Button
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => {
                    // Update all state in one batch
                    const newOverrides = { ...manualDefensePerTarget }
                    delete newOverrides[targetId]

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
                flexDirection: "column",
                gap: 1,
                alignItems: "flex-end",
              }}
            >
              <Button
                variant="contained"
                size="small"
                color="secondary"
                onClick={() => {
                  // Update all state in one batch
                  const newFortuneDice = { ...fortuneDiePerTarget }
                  delete newFortuneDice[targetId]

                  const newOverrides = { ...manualDefensePerTarget }
                  delete newOverrides[targetId]

                  const newDefenseChoices = {
                    ...defenseChoicePerTarget,
                    [targetId]: "dodge" as DefenseChoice,
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
                value={parseInt(fortuneDiePerTarget[targetId] || "0") || 0}
                size="small"
                width="80px"
                error={false}
                disabled={false}
                onChange={e => {
                  const newFortuneDice = {
                    ...fortuneDiePerTarget,
                    [targetId]: e.target.value,
                  }
                  updateField("fortuneDiePerTarget", newFortuneDice)

                  // Recalculate defense immediately with the new values
                  updateDefenseAndToughness(
                    selectedTargetIds,
                    stunt,
                    defenseChoicePerTarget,
                    newFortuneDice,
                    manualDefensePerTarget
                  )
                }}
                onBlur={e => {
                  const newFortuneDice = {
                    ...fortuneDiePerTarget,
                    [targetId]: e.target.value,
                  }
                  updateField("fortuneDiePerTarget", newFortuneDice)

                  // Recalculate defense immediately with the new values
                  updateDefenseAndToughness(
                    selectedTargetIds,
                    stunt,
                    defenseChoicePerTarget,
                    newFortuneDice,
                    manualDefensePerTarget
                  )
                }}
              />
            </Box>
          ))}
      </Box>
    </Box>
  )
}
