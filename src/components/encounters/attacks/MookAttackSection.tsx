"use client"

import {
  Box,
  Button,
  Stack,
  Typography,
  Alert,
  Divider,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { CS } from "@/services"
import type {
  MookAttackSectionProps
} from "@/types"
import { NumberField } from "@/components/ui"

export default function MookAttackSection({
  attacker,
  allShots,
  selectedTargetIds,
  mookRolls,
  showMookRolls,
  totalAttackingMooks,
  finalDamage,
  shotCost,
  attackValue,
  isProcessing,
  updateField,
  handleRollMookAttacks,
  handleApplyDamage,
}: MookAttackSectionProps) {
  if (!attacker || !CS.isMook(attacker)) return null
  
  // For backward compatibility with single target
  const target = selectedTargetIds[0] ? allShots.find(s => s.character?.shot_id === selectedTargetIds[0])?.character : undefined
  
  return (
    <>
      {/* Mook Attack Resolution */}
      <Stack spacing={2} alignItems="center">
        <Typography variant="body2" sx={{ textAlign: "center" }}>
          {totalAttackingMooks || attacker.count || 0} mooks
          attacking
        </Typography>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleRollMookAttacks}
          disabled={(!target && selectedTargetIds.length === 0) || !attackValue}
          sx={{ mb: 2 }}
        >
          Roll Mook Attacks
        </Button>

        {/* Mook Attack Rolls Display */}
        {showMookRolls && mookRolls.length > 0 && (
          <Box
            sx={{
              width: "100%",
              maxHeight: 400,
              overflowY: "auto",
              mb: 2,
            }}
          >
            <Stack spacing={2}>
              {mookRolls.map((targetGroup, groupIndex) => {
                const targetShot = allShots.find(s => s.character?.shot_id === targetGroup.targetId)
                const targetChar = targetShot?.character
                const targetDefense = targetChar ? CS.defense(targetChar) : 0
                const targetToughness = targetChar ? CS.toughness(targetChar) : 0
                const hits = targetGroup.rolls.filter(r => r.hit).length
                const totalWounds = targetGroup.rolls.reduce((sum, r) => sum + r.wounds, 0)
                
                return (
                  <Alert key={groupIndex} severity="info" sx={{ pb: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                      Attacking {targetGroup.targetName} 
                      ({targetGroup.rolls.length} mooks, DV {targetDefense}{CS.isMook(targetChar) ? "" : `, Toughness ${targetToughness}`})
                    </Typography>
                    <Stack spacing={0.5} sx={{ mb: 1 }}>
                      {targetGroup.rolls.map((roll, index) => (
                        <Typography
                          key={index}
                          variant="caption"
                          sx={{ display: "block" }}
                        >
                          Mook {roll.mookNumber}: AV {attackValue} + Swerve{" "}
                          {roll.swerve} = {roll.actionResult} vs DV{" "}
                          {targetDefense} ={" "}
                          {roll.hit ? (
                            <span style={{ color: "#4caf50" }}>
                              Hit! ({CS.isMook(targetChar) ? `${roll.wounds} mook eliminated` : `${roll.wounds} wounds`})
                            </span>
                          ) : (
                            <span style={{ color: "#f44336" }}>Miss</span>
                          )}
                        </Typography>
                      ))}
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      <strong>
                        {targetGroup.targetName}: {hits}/{targetGroup.rolls.length} hits, {totalWounds} {CS.isMook(targetChar) ? "mooks eliminated" : "wounds total"}
                      </strong>
                    </Typography>
                  </Alert>
                )
              })}
              
              {/* Per-Target Wounds Summary */}
              {mookRolls.length > 0 && (
                <Alert severity="warning" sx={{ position: 'sticky', bottom: 0, zIndex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Wounds to Apply:
                  </Typography>
                  <Stack spacing={0.5}>
                    {mookRolls.map((targetGroup) => {
                      const totalWounds = targetGroup.rolls.reduce((sum, r) => sum + r.wounds, 0)
                      return (
                        <Typography key={targetGroup.targetId} variant="body2">
                          <strong>{targetGroup.targetName}:</strong> {totalWounds} wounds
                        </Typography>
                      )
                    })}
                  </Stack>
                </Alert>
              )}
            </Stack>
          </Box>
        )}

        {/* Final Damage and Apply Button */}
        {/* Hide Total Wounds field when mooks attack multiple targets */}
        {selectedTargetIds.length <= 1 ? (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" sx={{ mb: 0.5 }}>
                Total Wounds
              </Typography>
              <NumberField
                name="finalDamage"
                value={parseInt(finalDamage) || 0}
                size="large"
                width="120px"
                error={false}
                onChange={e => updateField("finalDamage", e.target.value)}
                onBlur={e => updateField("finalDamage", e.target.value)}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleApplyDamage}
                disabled={!target || !finalDamage || isProcessing}
                size="large"
                startIcon={<CheckCircleIcon />}
                sx={{ height: 56, px: 3 }}
              >
                Apply Wounds
              </Button>
              {finalDamage && shotCost && (
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, textAlign: "center" }}
                >
                  Apply {finalDamage} wounds, spend {shotCost} shots
                </Typography>
              )}
            </Box>
          </Stack>
        ) : (
          /* For multiple targets, show apply button without total field */
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyDamage}
              disabled={selectedTargetIds.length === 0 || !showMookRolls || isProcessing}
              size="large"
              startIcon={<CheckCircleIcon />}
              sx={{ px: 3 }}
            >
              Apply Wounds
            </Button>
            {shotCost && (
              <Typography
                variant="caption"
                sx={{ mt: 1, display: "block", textAlign: "center" }}
              >
                Spend {shotCost} shots
              </Typography>
            )}
          </Box>
        )}
      </Stack>
    </>
  )
}