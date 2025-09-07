"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Chip,
} from "@mui/material"
import { useEncounter, useToast, useClient } from "@/contexts"
import { CS } from "@/services"
import { NumberField } from "@/components/ui"
import { getAllVisibleShots } from "./attacks/shotSorting"

interface UpCheckPanelProps {
  onClose?: () => void
  onComplete?: () => void
}

export default function UpCheckPanel({
  onClose,
  onComplete,
}: UpCheckPanelProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()

  // Form state
  const [selectedCharacterId, setSelectedCharacterId] = useState("")
  const [swerve, setSwerve] = useState("0")
  const [fortuneDie, setFortuneDie] = useState("0")
  const [useFortune, setUseFortune] = useState(false)
  const [bossDieRoll, setBossDieRoll] = useState("0")
  const [isProcessing, setIsProcessing] = useState(false)

  // Delay rendering for animation
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Get all characters that require Up Checks (PCs, Allies, Bosses, Uber-Bosses)
  const charactersRequiringUpCheck = useMemo(() => {
    if (!encounter?.shots) return []

    return getAllVisibleShots(encounter.shots)
      .filter(shot => {
        const character = shot.character
        if (!character) return false

        // Check if character has up_check_required status
        const status = character.status || []
        return status.includes("up_check_required")
      })
      .map(shot => shot.character!)
  }, [encounter?.shots])

  // Get selected character
  const selectedCharacter = charactersRequiringUpCheck.find(
    c => c.id === selectedCharacterId
  )

  // Check if selected character is Boss or Uber-Boss
  const isBossType = useMemo(() => {
    if (!selectedCharacter) return false
    const characterType = selectedCharacter.action_values?.["Type"]
    return characterType === "Boss" || characterType === "Uber-Boss"
  }, [selectedCharacter])

  // Calculate Up Check result for PC/Ally
  const upCheckResult = useMemo(() => {
    if (!selectedCharacter || isBossType) return { total: 0, willPass: false }

    const toughness = selectedCharacter.action_values?.["Toughness"] || 0
    const swerveValue = parseInt(swerve, 10) || 0
    const fortuneValue = useFortune ? parseInt(fortuneDie, 10) || 0 : 0
    const total = toughness + swerveValue + fortuneValue
    const willPass = total >= 5

    return { total, willPass, toughness, swerveValue, fortuneValue }
  }, [selectedCharacter, swerve, fortuneDie, useFortune, isBossType])

  // Calculate Boss Up Check result
  const bossUpCheckResult = useMemo(() => {
    if (!selectedCharacter || !isBossType)
      return { willPass: false, dieValue: 0 }

    const dieValue = parseInt(bossDieRoll, 10) || 0
    const willPass = dieValue >= 1 && dieValue <= 3 // 1-3 stays in fight, 4-6 is out

    return { willPass, dieValue }
  }, [selectedCharacter, bossDieRoll, isBossType])

  const handleApplyUpCheck = async () => {
    if (!selectedCharacter) {
      toastError("No character selected")
      return
    }

    if (!encounter) {
      toastError("No active encounter")
      return
    }

    setIsProcessing(true)

    try {
      if (isBossType) {
        // Boss/Uber-Boss Up Check
        const dieValue = parseInt(bossDieRoll, 10) || 0
        const passed = dieValue >= 1 && dieValue <= 3

        // For Boss types, send 1 for pass, 0 for fail as the swerve value
        // Backend will interpret this as pass/fail
        await client.applyUpCheck(
          encounter,
          selectedCharacter.id,
          passed ? 1 : 0, // 1 = passed, 0 = failed
          0
        )

        if (passed) {
          toastSuccess(
            `${selectedCharacter.name} rolled ${dieValue} and stays in the fight!`
          )
        } else {
          toastError(
            `${selectedCharacter.name} rolled ${dieValue} and is out of the fight!`
          )
        }
      } else {
        // PC/Ally Up Check
        const fortuneValue = useFortune ? parseInt(fortuneDie, 10) || 0 : 0

        await client.applyUpCheck(
          encounter,
          selectedCharacter.id,
          parseInt(swerve, 10) || 0,
          fortuneValue
        )

        if (upCheckResult.willPass) {
          toastSuccess(
            `${selectedCharacter.name} succeeded the Up Check! (${upCheckResult.total} ≥ 5)`
          )
        } else {
          toastError(
            `${selectedCharacter.name} failed the Up Check and is out of the fight! (${upCheckResult.total} < 5)`
          )
        }
      }

      // Reset form
      setSelectedCharacterId("")
      setSwerve("0")
      setFortuneDie("0")
      setUseFortune(false)
      setBossDieRoll("0")

      if (onComplete) onComplete()
      if (onClose) onClose()
    } catch (error) {
      console.error("Failed to apply Up Check:", error)
      toastError("Failed to apply Up Check")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box sx={{ overflow: "hidden", minHeight: isReady ? "auto" : "100px" }}>
      <Typography
        variant="h6"
        sx={{
          p: 1,
          fontWeight: "bold",
          backgroundColor: "background.paper",
          borderBottom: "2px solid",
          borderBottomColor: "divider",
        }}
      >
        🎲 Up Check
      </Typography>

      {isReady ? (
        <>
          {/* Character Selection Section */}
          <Box sx={{ backgroundColor: "action.hover" }}>
            <Box
              sx={{
                p: { xs: 1, sm: 1.5 },
                borderBottom: "2px solid",
                borderBottomColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: "warning.main" }}>
                💀 Characters Requiring Up Check
              </Typography>

              {charactersRequiringUpCheck.length > 0 ? (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {charactersRequiringUpCheck.map(character => (
                    <Chip
                      key={character.id}
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography>{character.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({CS.wounds(character)} wounds)
                          </Typography>
                        </Box>
                      }
                      onClick={() => setSelectedCharacterId(character.id)}
                      color={
                        selectedCharacterId === character.id
                          ? "warning"
                          : "default"
                      }
                      variant={
                        selectedCharacterId === character.id
                          ? "filled"
                          : "outlined"
                      }
                      disabled={isProcessing}
                      sx={{ cursor: "pointer" }}
                    />
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  No characters currently require Up Checks
                </Alert>
              )}

              {selectedCharacter && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: "background.paper",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {selectedCharacter.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Wounds
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        {CS.wounds(selectedCharacter)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Toughness
                      </Typography>
                      <Typography variant="h6">
                        {selectedCharacter.action_values?.["Toughness"] || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Marks of Death
                      </Typography>
                      <Typography variant="h6" color="warning.main">
                        {selectedCharacter.action_values?.["Marks of Death"] ||
                          0}
                      </Typography>
                    </Box>
                    {CS.isPC(selectedCharacter) && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Fortune
                        </Typography>
                        <Typography variant="h6" color="primary.main">
                          {CS.fortune(selectedCharacter)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Up Check Resolution Section */}
          <Box
            sx={{ p: { xs: 2, sm: 3 }, backgroundColor: "background.default" }}
          >
            {selectedCharacter ? (
              <>
                {isBossType ? (
                  // Boss/Uber-Boss Up Check Interface
                  <>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Boss Up Check
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Roll 1d6: On 1-3, {selectedCharacter.name} stays in the
                        fight. On 4-6, they're out.
                      </Typography>

                      {/* Die Roll Input */}
                      <Box sx={{ width: 120 }}>
                        <Typography
                          variant="caption"
                          sx={{ mb: 0.5, display: "block" }}
                        >
                          Die Roll (1-6)
                        </Typography>
                        <NumberField
                          label=""
                          value={bossDieRoll}
                          onChange={e => setBossDieRoll(e.target.value)}
                          onBlur={() => {}}
                          min={1}
                          max={6}
                          disabled={isProcessing}
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Result Preview */}
                    {parseInt(bossDieRoll) >= 1 &&
                      parseInt(bossDieRoll) <= 6 && (
                        <Alert
                          severity={
                            bossUpCheckResult.willPass ? "success" : "error"
                          }
                          sx={{ mb: 3 }}
                        >
                          <Typography variant="body2">
                            <strong>{selectedCharacter.name}</strong> rolled{" "}
                            {bossUpCheckResult.dieValue} and will{" "}
                            <strong>
                              {bossUpCheckResult.willPass
                                ? "STAY IN THE FIGHT"
                                : "BE OUT OF THE FIGHT"}
                            </strong>
                          </Typography>
                        </Alert>
                      )}
                  </>
                ) : (
                  // PC/Ally Up Check Interface
                  <>
                    {/* Dice Input Section */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        mb: 3,
                        alignItems: "flex-start",
                      }}
                    >
                      {/* Swerve Input */}
                      <Box sx={{ width: 120 }}>
                        <Typography
                          variant="caption"
                          sx={{ mb: 0.5, display: "block" }}
                        >
                          Swerve Roll
                        </Typography>
                        <NumberField
                          label=""
                          value={swerve}
                          onChange={e => setSwerve(e.target.value)}
                          onBlur={() => {}}
                          min={-10}
                          max={10}
                          disabled={isProcessing}
                          size="small"
                        />
                      </Box>

                      {/* Fortune Die Section */}
                      {CS.isPC(selectedCharacter) &&
                        CS.fortune(selectedCharacter) > 0 && (
                          <Box>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={useFortune}
                                  onChange={e =>
                                    setUseFortune(e.target.checked)
                                  }
                                  disabled={isProcessing}
                                />
                              }
                              label="Use Fortune"
                              sx={{ mb: 0.5 }}
                            />
                            {useFortune && (
                              <Box sx={{ width: 120 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ mb: 0.5, display: "block" }}
                                >
                                  Fortune Die
                                </Typography>
                                <NumberField
                                  label=""
                                  value={fortuneDie}
                                  onChange={e => setFortuneDie(e.target.value)}
                                  onBlur={() => {}}
                                  min={0}
                                  max={6}
                                  disabled={isProcessing}
                                  size="small"
                                />
                              </Box>
                            )}
                          </Box>
                        )}
                    </Box>

                    {/* Result Summary */}
                    <Alert
                      severity={upCheckResult.willPass ? "success" : "error"}
                      sx={{ mb: 3 }}
                    >
                      <Typography variant="body2">
                        <strong>{selectedCharacter.name}</strong> will{" "}
                        <strong>
                          {upCheckResult.willPass ? "SUCCEED" : "FAIL"}
                        </strong>{" "}
                        the Up Check
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 1 }}
                      >
                        Toughness ({upCheckResult.toughness}) + Swerve (
                        {upCheckResult.swerveValue})
                        {useFortune &&
                          ` + Fortune (${upCheckResult.fortuneValue})`}{" "}
                        = {upCheckResult.total}
                        {upCheckResult.willPass ? " ≥ " : " < "}5
                      </Typography>
                      {upCheckResult.willPass ? (
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          Will gain 1 Mark of Death but remain in the fight
                          {useFortune && " (additional Mark for using Fortune)"}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          Will be taken out of the fight!
                        </Typography>
                      )}
                    </Alert>
                  </>
                )}
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a character requiring an Up Check
                </Typography>
              </Box>
            )}

            {/* Action Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleApplyUpCheck}
                disabled={
                  !selectedCharacter ||
                  isProcessing ||
                  (isBossType &&
                    (parseInt(bossDieRoll) < 1 || parseInt(bossDieRoll) > 6))
                }
                startIcon={isProcessing && <CircularProgress size={20} />}
                color={
                  !selectedCharacter
                    ? "primary"
                    : isBossType
                      ? bossUpCheckResult.willPass
                        ? "success"
                        : "error"
                      : upCheckResult.willPass
                        ? "success"
                        : "error"
                }
              >
                {isProcessing
                  ? "RESOLVING..."
                  : !selectedCharacter
                    ? "SELECT A CHARACTER"
                    : isBossType
                      ? "🎲 RESOLVE UP CHECK"
                      : "🎲 ROLL UP CHECK"}
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  )
}
