"use client"

import { Box, Button, Stack, Typography } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { CS } from "@/services"
import type { CombatResolutionProps } from "@/types"
import { NumberField } from "@/components/ui"

export default function CombatResolution({
  attacker,
  allShots,
  selectedTargetIds,
  swerve,
  finalDamage,
  shotCost,
  showMultiTargetResults,
  multiTargetResults,
  isProcessing,
  updateField,
  handleApplyDamage,
}: CombatResolutionProps) {
  // Get single target if applicable
  const target =
    selectedTargetIds.length === 1
      ? allShots.find(s => s.character?.shot_id === selectedTargetIds[0])
          ?.character
      : undefined

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, sm: 2 }}
      alignItems="center"
      justifyContent="center"
      sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}
    >
      {/* Dice Roll */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: { xs: "80px", sm: "auto" },
        }}
      >
        <Typography
          variant="caption"
          sx={{ mb: 0.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
        >
          Swerve
        </Typography>
        <NumberField
          name="swerve"
          value={swerve}
          size="large"
          width="120px"
          error={false}
          onChange={e => updateField("swerve", e.target.value)}
          onBlur={e => {
            const val = e.target.value
            if (val === "" || val === "-") {
              updateField("swerve", "0")
            } else {
              updateField("swerve", val)
            }
          }}
        />
      </Box>

      {/* Final Damage Override - Show for single non-mook target */}
      {selectedTargetIds.length === 1 &&
        (() => {
          const targetShot = allShots.find(
            s => s.character?.shot_id === selectedTargetIds[0]
          )
          const targetChar = targetShot?.character
          // Only show Smackdown for non-mooks
          return targetChar && !CS.isMook(targetChar) ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: { xs: "80px", sm: "auto" },
              }}
            >
              <Typography
                variant="caption"
                sx={{ mb: 0.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                Smackdown
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
          ) : null
        })()}

      {/* Apply Damage Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          height: "100%",
          pt: { xs: "8px", sm: "20px" },
          width: { xs: "100%", sm: "auto" },
          mt: { xs: 2, sm: 0 },
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleApplyDamage}
          disabled={
            (!target && selectedTargetIds.length === 0) ||
            (!finalDamage && !showMultiTargetResults) ||
            isProcessing
          }
          size="large"
          startIcon={<CheckCircleIcon />}
          sx={{
            height: 56,
            px: { xs: 2, sm: 3 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Resolve
        </Button>
        {attacker && target && finalDamage && shotCost && (
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              fontSize: { xs: "0.65rem", sm: "0.7rem" },
              textAlign: "left",
              color: "text.secondary",
            }}
          >
            {showMultiTargetResults && multiTargetResults.length > 0
              ? `Apply wounds to ${multiTargetResults.length} ${multiTargetResults.length === 1 ? "target" : "targets"}, spend ${shotCost} ${parseInt(shotCost) === 1 ? "shot" : "shots"}`
              : parseInt(finalDamage) > 0
                ? `Apply ${finalDamage} ${parseInt(finalDamage) === 1 ? "wound" : "wounds"}, spend ${shotCost} ${parseInt(shotCost) === 1 ? "shot" : "shots"}`
                : `Spend ${shotCost} ${parseInt(shotCost) === 1 ? "shot" : "shots"}`}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}
