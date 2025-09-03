"use client"

import { Alert, Stack, Typography } from "@mui/material"
import { CS } from "@/services"
import type { WoundsSummaryProps } from "@/types"

export default function WoundsSummary({
  multiTargetResults,
  allShots,
  calculateTargetDefense: _calculateTargetDefense,
  defenseChoicePerTarget,
  selectedTargetIds: _selectedTargetIds,
  attackValue: _attackValue,
  swerve: _swerve,
  weaponDamage: _weaponDamage,
  targetMookCount: _targetMookCount,
  finalDamage: _finalDamage,
}: WoundsSummaryProps) {
  return (
    <Alert severity="warning" sx={{ mt: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        Results:
      </Typography>
      <Stack spacing={0.5} sx={{ mt: 0.5 }}>
        {multiTargetResults.map(result => {
          const targetShot = allShots.find(
            s => s.character?.shot_id === result.targetId
          )
          const targetChar = targetShot?.character
          if (!targetChar) return null

          // Just use the wounds already calculated in multiTargetResults
          const effectiveWounds = result.wounds

          return (
            <Typography key={result.targetId} variant="body2">
              <strong>{result.targetName}:</strong>{" "}
              {CS.isMook(targetChar)
                ? `${effectiveWounds} ${effectiveWounds === 1 ? "mook" : "mooks"} taken out`
                : `${effectiveWounds} ${effectiveWounds === 1 ? "wound" : "wounds"}`}
              {defenseChoicePerTarget[result.targetId] === "dodge" &&
                ` (dodged)`}
              {defenseChoicePerTarget[result.targetId] === "fortune" &&
                ` (fortune dodge)`}
            </Typography>
          )
        })}
      </Stack>
    </Alert>
  )
}
