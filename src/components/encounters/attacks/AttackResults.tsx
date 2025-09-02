"use client"

import { Box, Stack, Typography, Alert } from "@mui/material"
import { CS } from "@/services"
import type { AttackResultsProps } from "@/types"

export default function AttackResults({
  attacker,
  attackerWeapons,
  allShots,
  selectedTargetIds,
  multiTargetResults,
  attackValue,
  swerve,
  defenseValue,
  weaponDamage,
  smackdown,
  defenseChoicePerTarget,
  calculateEffectiveAttackValue,
  calculateTargetDefense,
}: AttackResultsProps) {
  if (CS.isMook(attacker) || multiTargetResults.length === 0) {
    return null
  }

  const effectiveAttack = calculateEffectiveAttackValue(
    attacker,
    attackerWeapons,
    allShots
  )
  const outcome =
    effectiveAttack + parseInt(swerve || "0") - parseInt(defenseValue || "0")
  const isHit = outcome >= 0
  const defenseLabel =
    selectedTargetIds.length === 1 ? "Defense" : "Combined Defense"

  // Check if all targets are mooks
  const allTargetsAreMooks = selectedTargetIds.every(id => {
    const shot = allShots.find(s => s.character?.shot_id === id)
    return shot?.character && CS.isMook(shot.character)
  })

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      {/* Overall attack calculation */}
      <Alert severity={isHit ? "success" : "error"} sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
          {isHit ? "Hit!" : "Miss!"} Attack Value {attackValue} + Swerve{" "}
          {swerve} = Action Result {effectiveAttack + parseInt(swerve || "0")}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
          Action Result {effectiveAttack + parseInt(swerve || "0")} -{" "}
          {defenseLabel} {defenseValue} = Outcome {outcome}
        </Typography>
        {isHit && !allTargetsAreMooks && (
          <Typography variant="caption" sx={{ display: "block" }}>
            Outcome {outcome} + Weapon Damage {weaponDamage} = Smackdown{" "}
            {smackdown}
          </Typography>
        )}
      </Alert>

      {/* Individual target results - only show for non-mook targets */}
      {!allTargetsAreMooks && (
        <Stack spacing={2}>
          {multiTargetResults.map(result => {
            const targetShot = allShots.find(
              s => s.character?.shot_id === result.targetId
            )
            const targetChar = targetShot?.character
            if (!targetChar) return null

            const hasDefenseModifier =
              defenseChoicePerTarget[result.targetId] &&
              defenseChoicePerTarget[result.targetId] !== "none"

            // Use the smackdown from props (which can be manually edited)
            const smackdownValue = parseInt(smackdown || "0")
            let effectiveWounds = result.wounds

            // Recalculate wounds based on the current smackdown value
            if (smackdownValue > 0) {
              const targetToughness = CS.toughness(targetChar)
              effectiveWounds = Math.max(0, smackdownValue - targetToughness)

              // For mooks, convert wounds to kills
              if (CS.isMook(targetChar)) {
                effectiveWounds = Math.min(
                  effectiveWounds,
                  targetChar.count || 0
                )
              }
            } else {
              effectiveWounds = 0
            }

            const isTargetHit = outcome >= 0

            return (
              <Alert
                key={result.targetId}
                severity={isTargetHit ? "info" : "warning"}
                sx={{ position: "relative" }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "bold", mb: 0.5 }}
                >
                  {targetChar.name}
                  {hasDefenseModifier && " (defense modified)"}
                </Typography>

                {/* For multiple targets, just show smackdown application */}
                {isTargetHit && (
                  <>
                    {!CS.isMook(targetChar) && (
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        Smackdown {smackdownValue} - Toughness{" "}
                        {CS.toughness(targetChar)} = {effectiveWounds} wounds
                      </Typography>
                    )}
                  </>
                )}

                <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                  Result:{" "}
                  {isTargetHit
                    ? CS.isMook(targetChar)
                      ? `${effectiveWounds} mooks eliminated`
                      : `${effectiveWounds} wounds`
                    : "Miss"}
                  {result.killed && " - TAKEN OUT!"}
                </Typography>
              </Alert>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
