"use client"

import { Alert, Stack, Typography } from "@mui/material"
import { CS } from "@/services"
import type { Character, Shot } from "@/types"

interface WoundsSummaryProps {
  multiTargetResults: Array<{
    targetId: string
    targetName: string
    defense: number
    toughness: number
    wounds: number
  }>
  allShots: Shot[]
  calculateTargetDefense: (target: Character, targetId: string) => number
  defenseChoicePerTarget: { [targetId: string]: 'none' | 'dodge' | 'fortune' }
  selectedTargetIds: string[]
  attackValue: string
  swerve: string
  weaponDamage: string
  targetMookCount: number
  finalDamage: string
}

export default function WoundsSummary({
  multiTargetResults,
  allShots,
  calculateTargetDefense,
  defenseChoicePerTarget,
  selectedTargetIds,
  attackValue,
  swerve,
  weaponDamage,
  targetMookCount,
  finalDamage,
}: WoundsSummaryProps) {
  return (
    <Alert severity="warning" sx={{ mt: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        Wounds to Apply:
      </Typography>
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        {multiTargetResults.map((result) => {
          const targetShot = allShots.find(s => s.character?.shot_id === result.targetId)
          const targetChar = targetShot?.character
          if (!targetChar) return null
          
          const currentDefense = calculateTargetDefense(targetChar, result.targetId)
          const hasDefenseModifier = defenseChoicePerTarget[result.targetId] && defenseChoicePerTarget[result.targetId] !== 'none'
          
          // Use same logic as in individual results
          let effectiveWounds = result.wounds
          if (hasDefenseModifier && selectedTargetIds.length > 1) {
            const individualOutcome = parseInt(attackValue || "0") + parseInt(swerve || "0") - currentDefense
            if (individualOutcome >= 0) {
              // For mooks, wounds = number taken out; for others, calculate normally
              if (CS.isMook(targetChar)) {
                effectiveWounds = targetMookCount
              } else {
                const individualSmackdown = individualOutcome + parseInt(weaponDamage || "0")
                effectiveWounds = Math.max(0, individualSmackdown - CS.toughness(targetChar))
              }
            } else {
              effectiveWounds = 0
            }
          } else if (selectedTargetIds.length === 1 && finalDamage && !CS.isMook(targetChar)) {
            // For single target with manual smackdown override
            const smackdown = parseInt(finalDamage || "0")
            effectiveWounds = Math.max(0, smackdown - CS.toughness(targetChar))
          }
          
          return (
            <Typography key={result.targetId} variant="body2">
              <strong>{result.targetName}:</strong> {CS.isMook(targetChar) 
                ? `${effectiveWounds} ${effectiveWounds === 1 ? 'mook' : 'mooks'} taken out`
                : `${effectiveWounds} ${effectiveWounds === 1 ? 'wound' : 'wounds'}`
              }
              {defenseChoicePerTarget[result.targetId] === 'dodge' && ` (dodged)`}
              {defenseChoicePerTarget[result.targetId] === 'fortune' && ` (fortune dodge)`}
            </Typography>
          )
        })}
      </Stack>
    </Alert>
  )
}