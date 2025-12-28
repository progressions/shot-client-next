"use client"

import { Box, Button, Typography, Stack, keyframes } from "@mui/material"
import { GiCrossedSwords } from "react-icons/gi"
import { CS } from "@/services"
import type { Character, Shot } from "@/types"
import { NumberField } from "@/components/ui"

// Subtle pulse animation for the action zone when ready
const readyPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 4px rgba(211, 47, 47, 0.2);
  }
`

// Impact animation for the apply button
const impactReady = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`

interface ActionZoneProps {
  // Attack values
  attackValue: string
  swerve: string
  smackdown: string
  finalDamage: string
  shotCost: string
  defenseValue: string
  toughnessValue: string
  weaponDamage: string

  // Target info
  selectedTargetIds: string[]
  allShots: Shot[]
  attacker: Character | null

  // Multi-target
  showMultiTargetResults: boolean
  multiTargetResults: Array<{
    targetId: string
    outcome: number
    wounds: number
  }>

  // State
  isProcessing: boolean

  // Handlers
  updateField: (name: string, value: unknown) => void
  handleApplyDamage: () => void
}

export default function ActionZone({
  attackValue,
  swerve,
  smackdown,
  finalDamage,
  shotCost,
  defenseValue,
  toughnessValue,
  weaponDamage,
  selectedTargetIds,
  allShots,
  attacker,
  showMultiTargetResults,
  multiTargetResults,
  isProcessing,
  updateField,
  handleApplyDamage,
}: ActionZoneProps) {
  // Calculate if we have a valid attack scenario
  const hasTargets = selectedTargetIds.length > 0
  const hasSwerve = swerve !== "" && swerve !== undefined
  const parsedSwerve = parseInt(swerve) || 0
  const parsedAttack = parseInt(attackValue) || 0
  const parsedDefense = parseInt(defenseValue) || 0
  const parsedDamage = parseInt(weaponDamage) || 0
  const parsedToughness = parseInt(toughnessValue) || 0

  // Calculate outcome preview
  const actionResult = parsedAttack + parsedSwerve
  const outcome = actionResult - parsedDefense
  const isHit = outcome >= 0

  // Get target info for display
  const targetNames = selectedTargetIds
    .map(id => {
      const shot = allShots.find(s => s.character?.shot_id === id)
      return shot?.character?.name || "Unknown"
    })
    .slice(0, 3)

  const remainingTargets = selectedTargetIds.length - 3

  // Determine if the Apply button should be enabled
  const canApply =
    hasTargets &&
    hasSwerve &&
    !isProcessing &&
    (finalDamage || showMultiTargetResults)

  // Get the primary target for single-target display
  const primaryTarget =
    selectedTargetIds.length === 1
      ? allShots.find(s => s.character?.shot_id === selectedTargetIds[0])
          ?.character
      : null

  const showSmackdown = primaryTarget && !CS.isMook(primaryTarget) && hasSwerve

  return (
    <Box
      sx={{
        mt: 2,
        p: 0,
        borderRadius: 2,
        overflow: "hidden",
        border: "2px solid",
        borderColor: hasTargets ? "error.main" : "divider",
        backgroundColor: "background.paper",
        animation: canApply ? `${readyPulse} 2s ease-in-out infinite` : "none",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          backgroundColor: hasTargets ? "error.dark" : "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <GiCrossedSwords size={20} color={hasTargets ? "#fff" : "inherit"} />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: hasTargets ? "white" : "text.secondary",
            textTransform: "uppercase",
          }}
        >
          Resolve Attack
        </Typography>
        {hasTargets && (
          <Typography
            variant="caption"
            sx={{
              ml: "auto",
              color: "rgba(255,255,255,0.8)",
              fontStyle: "italic",
            }}
          >
            vs {targetNames.join(", ")}
            {remainingTargets > 0 && ` +${remainingTargets} more`}
          </Typography>
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ p: 2 }}>
        {!hasTargets ? (
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "center",
              py: 2,
              fontStyle: "italic",
            }}
          >
            Select a target above to resolve the attack
          </Typography>
        ) : (
          <Stack spacing={2}>
            {/* Attack Math Display */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {/* Attack Value */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: "0.65rem" }}
                >
                  Attack
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  {parsedAttack}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ color: "text.secondary" }}>
                +
              </Typography>

              {/* Swerve Input - THE STAR OF THE SHOW */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <NumberField
                  name="swerve"
                  label="Swerve"
                  labelBackgroundColor={theme => theme.palette.background.paper}
                  value={swerve}
                  size="small"
                  width="90px"
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
                      height: 48,
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      "& input": {
                        padding: "8px 12px",
                        textAlign: "center",
                      },
                      backgroundColor: "background.default",
                      border: "2px solid",
                      borderColor: "error.main",
                      "&:hover": {
                        borderColor: "error.light",
                      },
                      "&.Mui-focused": {
                        borderColor: "error.light",
                        boxShadow: "0 0 8px rgba(211, 47, 47, 0.3)",
                      },
                    },
                  }}
                />
              </Box>

              <Typography variant="h6" sx={{ color: "text.secondary" }}>
                vs
              </Typography>

              {/* Defense Value */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: "0.65rem" }}
                >
                  Defense
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "warning.main" }}
                >
                  {parsedDefense}
                </Typography>
              </Box>

              {/* Outcome Arrow & Result */}
              {hasSwerve && (
                <>
                  <Typography
                    variant="h6"
                    sx={{ color: "text.secondary", mx: 1 }}
                  >
                    →
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      backgroundColor: isHit ? "success.dark" : "error.dark",
                      minWidth: 60,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.65rem",
                      }}
                    >
                      {isHit ? "HIT" : "MISS"}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "white" }}
                    >
                      {outcome >= 0 ? `+${outcome}` : outcome}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {/* Damage Calculation - shows when hit */}
            {hasSwerve && isHit && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  py: 1,
                  px: 2,
                  backgroundColor: "action.hover",
                  borderRadius: 1,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block" }}
                  >
                    Outcome
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {outcome}
                  </Typography>
                </Box>
                <Typography sx={{ color: "text.secondary" }}>+</Typography>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block" }}
                  >
                    Damage
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {parsedDamage}
                  </Typography>
                </Box>
                {showSmackdown && (
                  <>
                    <Typography sx={{ color: "text.secondary" }}>=</Typography>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}
                      >
                        Smackdown
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", color: "error.main" }}
                      >
                        {smackdown || outcome + parsedDamage}
                      </Typography>
                    </Box>
                  </>
                )}
                {showSmackdown && (
                  <>
                    <Typography sx={{ color: "text.secondary" }}>−</Typography>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}
                      >
                        Toughness
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", color: "info.main" }}
                      >
                        {parsedToughness}
                      </Typography>
                    </Box>
                  </>
                )}
                <Typography sx={{ color: "text.secondary" }}>→</Typography>
                <Box
                  sx={{
                    textAlign: "center",
                    px: 2,
                    py: 0.5,
                    backgroundColor: "error.main",
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.8)", display: "block" }}
                  >
                    {primaryTarget && CS.isMook(primaryTarget)
                      ? "Mooks"
                      : "Wounds"}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "white" }}
                  >
                    {finalDamage || 0}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Multi-target summary */}
            {showMultiTargetResults && multiTargetResults.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {multiTargetResults.map((result, idx) => {
                  const shot = allShots.find(
                    s => s.character?.shot_id === result.targetId
                  )
                  const name = shot?.character?.name || "Target"
                  return (
                    <Box
                      key={result.targetId}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        backgroundColor:
                          result.wounds > 0 ? "error.dark" : "action.hover",
                        borderRadius: 1,
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            result.wounds > 0
                              ? "rgba(255,255,255,0.8)"
                              : "text.secondary",
                          display: "block",
                          fontSize: "0.65rem",
                        }}
                      >
                        {name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: result.wounds > 0 ? "white" : "text.primary",
                        }}
                      >
                        {result.wounds > 0 ? `${result.wounds} wounds` : "Miss"}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            )}

            {/* APPLY DAMAGE BUTTON - Prominent and unmissable */}
            <Button
              variant="contained"
              color="error"
              size="large"
              onClick={handleApplyDamage}
              disabled={!canApply}
              startIcon={<GiCrossedSwords size={24} />}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                animation: canApply
                  ? `${impactReady} 1.5s ease-in-out infinite`
                  : "none",
                "&:not(:disabled)": {
                  background:
                    "linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)",
                  boxShadow: "0 4px 12px rgba(211, 47, 47, 0.4)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                    boxShadow: "0 6px 16px rgba(211, 47, 47, 0.5)",
                    transform: "translateY(-1px)",
                  },
                },
                "&:disabled": {
                  backgroundColor: "action.disabledBackground",
                  color: "action.disabled",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isProcessing
                ? "Applying..."
                : hasSwerve && isHit
                  ? selectedTargetIds.length > 1
                    ? "Apply Wounds"
                    : primaryTarget && CS.isMook(primaryTarget)
                      ? `Kill ${finalDamage || 0} Mook${(parseInt(finalDamage) || 0) === 1 ? "" : "s"}`
                      : `Apply ${finalDamage || 0} Wounds`
                  : hasSwerve && !isHit
                    ? "Apply Miss"
                    : "Enter Swerve to Resolve"}
            </Button>

            {/* Shot cost reminder */}
            {canApply && (
              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                This action costs {shotCost} shot
                {parseInt(shotCost) !== 1 ? "s" : ""}
              </Typography>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
