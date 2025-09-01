"use client"

import {
  Box,
  Stack,
  Typography,
  Alert,
} from "@mui/material"
import { CS } from "@/services"
import type {
  AttackResultsProps
} from "@/types"

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
  defenseChoicePerTarget,
  calculateEffectiveAttackValue,
  calculateTargetDefense,
}: AttackResultsProps) {
  if (CS.isMook(attacker) || multiTargetResults.length === 0) {
    return null
  }

  const effectiveAttack = calculateEffectiveAttackValue(attacker, attackerWeapons, allShots)
  const mookBonus = effectiveAttack - parseInt(attackValue || "0")
  const outcome = effectiveAttack + parseInt(swerve || "0") - parseInt(defenseValue || "0")
  const isHit = outcome >= 0
  const defenseLabel = selectedTargetIds.length === 1 ? "Defense" : "Combined Defense"
  const attackDisplay = mookBonus > 0 
    ? `${attackValue} (+${mookBonus} vs mooks)` 
    : attackValue
  
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
          {isHit ? "Hit!" : "Miss!"} Attack Value {attackDisplay} + Swerve {swerve} = Action Result {effectiveAttack + parseInt(swerve || "0")}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
          Action Result {effectiveAttack + parseInt(swerve || "0")} - {defenseLabel} {defenseValue} = Outcome {outcome}
        </Typography>
        {isHit && !allTargetsAreMooks && (
          <Typography variant="caption" sx={{ display: "block" }}>
            Outcome {outcome} + Weapon Damage {weaponDamage} = Smackdown {outcome + parseInt(weaponDamage || "0")}
          </Typography>
        )}
      </Alert>

      {/* Individual target results - only show for non-mook targets */}
      {!allTargetsAreMooks && (
        <Stack spacing={2}>
        {multiTargetResults.map((result) => {
          const targetShot = allShots.find(s => s.character?.shot_id === result.targetId)
          const targetChar = targetShot?.character
          if (!targetChar) return null
          
          const currentDefense = calculateTargetDefense(targetChar, result.targetId)
          const hasDefenseModifier = defenseChoicePerTarget[result.targetId] && defenseChoicePerTarget[result.targetId] !== 'none'
          
          // Calculate smackdown for this target
          let individualOutcome: number
          let smackdown: number
          let effectiveWounds = result.wounds
          
          if (selectedTargetIds.length === 1) {
            // Single target: use the global outcome calculation
            individualOutcome = outcome
            smackdown = outcome + parseInt(weaponDamage || "0")
          } else {
            // Multiple targets: recalculate for this specific target
            const targetSpecificOutcome = effectiveAttack + parseInt(swerve || "0") - currentDefense
            individualOutcome = targetSpecificOutcome
            smackdown = targetSpecificOutcome + parseInt(weaponDamage || "0")
            
            // Recalculate wounds based on this target's actual defense and toughness
            if (targetSpecificOutcome >= 0) {
              const targetToughness = CS.toughness(targetChar)
              effectiveWounds = Math.max(0, smackdown - targetToughness)
              
              // For mooks, convert wounds to kills
              if (CS.isMook(targetChar)) {
                effectiveWounds = Math.min(effectiveWounds, targetChar.count || 0)
              }
            } else {
              effectiveWounds = 0
            }
          }
          
          const isTargetHit = individualOutcome >= 0
          
          return (
            <Alert 
              key={result.targetId} 
              severity={isTargetHit ? "info" : "warning"}
              sx={{ position: 'relative' }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                {targetChar.name} 
                {hasDefenseModifier && " (defense modified)"}
              </Typography>
              
              {/* Show the calculation for this target */}
              <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                Action Result {effectiveAttack + parseInt(swerve || "0")} - Defense {currentDefense} = Outcome {individualOutcome}
              </Typography>
              
              {isTargetHit && (
                <>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    Outcome {individualOutcome} + Weapon Damage {weaponDamage} = Smackdown {smackdown}
                  </Typography>
                  {!CS.isMook(targetChar) && (
                    <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                      Smackdown {smackdown} - Toughness {CS.toughness(targetChar)} = {effectiveWounds} wounds
                    </Typography>
                  )}
                </>
              )}
              
              <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                Result: {isTargetHit 
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