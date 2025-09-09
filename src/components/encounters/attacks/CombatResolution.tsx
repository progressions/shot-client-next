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
  smackdown,
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
    <Box sx={{ p: 1, backgroundColor: "action.hover", borderRadius: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, fontWeight: "bold", color: "text.secondary" }}
      >
        RESOLUTION
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ flexWrap: "nowrap" }}
      >
        {/* Dice Roll */}
        <Box sx={{ flex: 1 }}>
          <NumberField
            name="swerve"
            label="Swerve"
            labelBackgroundColor="#904340"
            value={swerve}
            size="small"
            width="100px"
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
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 40,
                "& input": { padding: "8px 12px" },
              },
            }}
          />
        </Box>

        {/* Smackdown Display - Show for single non-mook target when swerve is entered */}
        {selectedTargetIds.length === 1 &&
          swerve !== "" &&
          swerve !== "0" &&
          (() => {
            const targetShot = allShots.find(
              s => s.character?.shot_id === selectedTargetIds[0]
            )
            const targetChar = targetShot?.character
            // Only show Smackdown for non-mooks
            return targetChar && !CS.isMook(targetChar) ? (
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.7rem", color: "text.secondary" }}
                >
                  Smackdown
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100px",
                    height: 40,
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {parseInt(smackdown) || 0}
                  </Typography>
                </Box>
              </Box>
            ) : null
          })()}

        {/* Apply Damage Button */}
        <Box sx={{ flex: 0 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyDamage}
            disabled={
              (!target && selectedTargetIds.length === 0) ||
              (!finalDamage && !showMultiTargetResults) ||
              isProcessing
            }
            size="small"
            startIcon={<CheckCircleIcon />}
            sx={{
              height: 40,
              px: 2,
              minWidth: "120px",
            }}
          >
            APPLY DAMAGE
          </Button>
          {attacker && target && finalDamage && shotCost && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                fontSize: "0.65rem",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              {showMultiTargetResults && multiTargetResults.length > 0
                ? `${multiTargetResults.length} targets`
                : parseInt(finalDamage) > 0
                  ? `${finalDamage} wounds`
                  : `${shotCost} shots`}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  )
}
