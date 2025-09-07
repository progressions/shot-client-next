"use client"

import React, { useState, useMemo } from "react"
import { Box, Paper, Typography, Button, Alert, Divider } from "@mui/material"
import { FaDice } from "react-icons/fa6"
import { useEncounter, useToast, useClient } from "@/contexts"
import { CS } from "@/services"
import { CharacterLink } from "@/components/ui/links"
import { Avatar } from "@/components/avatars"
import { NumberField } from "@/components/ui"
import { getAllVisibleShots } from "./attacks/shotSorting"
import CharacterSelector from "./CharacterSelector"
import type { Character } from "@/types"

interface SpeedCheckPanelProps {
  selectedCharacter: Character | null
  onClose?: () => void
  onComplete?: () => void
}

export default function SpeedCheckPanel({
  selectedCharacter,
  onClose,
  onComplete,
}: SpeedCheckPanelProps) {
  const { encounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()
  const [submitting, setSubmitting] = useState(false)
  const [selectedTargetShotId, setSelectedTargetShotId] = useState<string>("")
  const [swerve, setSwerve] = useState<number>(0)
  const [fortuneBonus, setFortuneBonus] = useState<string>("0")
  const [usingFortune, setUsingFortune] = useState(false)

  // The selected character from the encounter is the preventer
  const selectedPreventer = selectedCharacter

  // Check if preventer is a PC and get available Fortune
  const isPreventerPC = selectedPreventer && CS.isPC(selectedPreventer)
  const availableFortune = isPreventerPC
    ? CS.fortune(selectedPreventer) || 0
    : 0

  // Get all shots for the CharacterSelector
  const allShots = useMemo(() => {
    if (!encounter?.shots) return []
    return getAllVisibleShots(encounter.shots)
  }, [encounter?.shots])

  // Get all characters attempting to escape
  const escapingCharacters = useMemo(() => {
    if (!encounter?.shots) return []

    const allShots = getAllVisibleShots(encounter.shots)
    return allShots
      .filter(shot => shot.character?.status?.includes("cheesing_it"))
      .map(shot => ({
        character: shot.character!,
        shot: shot.shot,
      }))
      .sort((a, b) => (b.shot || 0) - (a.shot || 0)) // Highest shot first
  }, [encounter?.shots])

  // Get the selected target character
  const selectedTarget = useMemo(() => {
    if (!selectedTargetShotId) return null
    const shot = allShots.find(
      s => s.character?.shot_id === selectedTargetShotId
    )
    return shot?.character || null
  }, [selectedTargetShotId, allShots])

  // Calculate the Speed Check result dynamically
  const speedCheckResult = useMemo(() => {
    if (!selectedPreventer || !selectedTarget) return null

    const preventerSpeed = CS.speed(selectedPreventer) || 0
    const targetSpeed = CS.speed(selectedTarget) || 5
    const fortuneBonusValue = parseInt(fortuneBonus) || 0
    const totalRoll = swerve + preventerSpeed + fortuneBonusValue
    const success = totalRoll >= targetSpeed

    return {
      preventerSpeed,
      targetSpeed,
      fortuneBonusValue,
      totalRoll,
      success,
    }
  }, [selectedPreventer, selectedTarget, swerve, fortuneBonus])

  // Get characters eligible to prevent escape of the selected target
  const eligiblePreventers = useMemo(() => {
    if (!encounter?.shots || !selectedTarget) return []

    const allShots = getAllVisibleShots(encounter.shots)
    // Find the shot of the selected target
    const targetShot = allShots.find(s => s.character?.id === selectedTarget.id)
    if (!targetShot) return []

    const targetShotNumber = targetShot.shot || 0

    // Characters acting after the selected escaping character can attempt prevention
    return allShots
      .filter(shot => {
        const char = shot.character
        if (!char) return false
        // Must be acting after the selected escaping character
        if ((shot.shot || 0) >= targetShotNumber) return false
        // Cannot already be escaping or escaped
        if (
          char.status?.includes("cheesing_it") ||
          char.status?.includes("cheesed_it")
        )
          return false
        return true
      })
      .map(shot => ({
        character: shot.character!,
        shot: shot.shot,
      }))
      .sort((a, b) => (b.shot || 0) - (a.shot || 0)) // Highest shot first
  }, [encounter?.shots, selectedTarget])

  const handlePreventEscape = async () => {
    if (!selectedPreventer || !selectedTarget || !encounter) return

    setSubmitting(true)
    try {
      // Get the target escaper
      const targetEscaper = selectedTarget

      // Calculate Speed Check difficulty
      const escapeeDifficulty = CS.speed(targetEscaper) || 5
      const preventerSpeed = CS.speed(selectedPreventer) || 0
      const fortuneBonusValue = parseInt(fortuneBonus) || 0
      const totalRoll = swerve + preventerSpeed + fortuneBonusValue

      const success = totalRoll >= escapeeDifficulty

      const characterUpdates = []

      // If using Fortune, deduct it from the preventer (PC only)
      if (fortuneBonusValue > 0 && isPreventerPC) {
        const currentFortune = CS.fortune(selectedPreventer)
        if (currentFortune > 0) {
          characterUpdates.push({
            character_id: selectedPreventer.id,
            action_values: {
              Fortune: currentFortune - 1,
            },
            event: {
              type: "fortune_spent",
              description: `${selectedPreventer.name} spent 1 Fortune point`,
              details: {
                character_id: selectedPreventer.id,
                fortune_bonus: fortuneBonusValue,
              },
            },
          })
        }
      }

      if (success) {
        // Prevention succeeds - remove cheesing_it status
        characterUpdates.push({
          character_id: targetEscaper.id,
          remove_status: ["cheesing_it"],
          event: {
            type: "escape_prevented",
            description: `${selectedPreventer.name} prevents ${targetEscaper.name} from escaping!`,
            details: {
              preventer_id: selectedPreventer.id,
              escapee_id: targetEscaper.id,
              roll: totalRoll,
              swerve: swerve,
              fortune_bonus: fortuneBonusValue,
              difficulty: escapeeDifficulty,
              success: true,
            },
          },
        })
        toastSuccess(`${selectedPreventer.name} prevents the escape!`)
      } else {
        // Prevention fails - escapee becomes "cheesed_it"
        characterUpdates.push({
          character_id: targetEscaper.id,
          remove_status: ["cheesing_it"],
          add_status: ["cheesed_it"],
          event: {
            type: "escape_succeeded",
            description: `${targetEscaper.name} successfully escapes!`,
            details: {
              preventer_id: selectedPreventer.id,
              escapee_id: targetEscaper.id,
              roll: totalRoll,
              swerve: swerve,
              fortune_bonus: fortuneBonusValue,
              difficulty: escapeeDifficulty,
              success: false,
            },
          },
        })
        toastSuccess(`${targetEscaper.name} escapes!`)
      }

      // Apply the updates using client.applyCombatAction
      await client.applyCombatAction(encounter, characterUpdates)
      if (onComplete) onComplete()
    } catch (error) {
      console.error("Failed to prevent escape:", error)
      toastError("Failed to process escape prevention")
    } finally {
      setSubmitting(false)
    }
  }

  if (escapingCharacters.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          mb: 2,
          position: "relative",
          border: "2px solid",
          borderColor: "info.main",
          backgroundColor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <FaDice size={24} />
          <Typography variant="h6" component="h2">
            Speed Check
          </Typography>
        </Box>

        <Alert severity="info">
          No characters are currently attempting to escape.
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper
      sx={{
        p: 3,
        mb: 2,
        position: "relative",
        border: "2px solid",
        borderColor: "warning.main",
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FaDice size={24} />
        <Typography variant="h6" component="h2">
          Speed Check - Prevent Escape
        </Typography>
      </Box>

      {/* Two-column layout */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Left column - Target Selection */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Select Escaping Character to Target:
          </Typography>
          <CharacterSelector
            shots={allShots}
            selectedShotId={selectedTargetShotId}
            onSelect={setSelectedTargetShotId}
            borderColor="warning.main"
            disabled={submitting}
            showShotNumbers={true}
            filterFunction={character =>
              !!character.status?.includes("cheesing_it")
            }
          />
          {selectedTarget && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar character={selectedTarget} hideVehicle size={48} />
              <Box>
                <CharacterLink character={selectedTarget} />
                <Typography variant="body2" color="text.secondary">
                  Speed: {CS.speed(selectedTarget)} (Difficulty)
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right column - Speed Check Resolution */}
        {selectedPreventer && selectedTarget && (
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mb: 0.5, color: "text.secondary" }}
                >
                  Swerve
                </Typography>
                <NumberField
                  name="swerve"
                  value={swerve}
                  onChange={e => setSwerve(parseInt(e.target.value) || 0)}
                  onBlur={e => setSwerve(parseInt(e.target.value) || 0)}
                  size="small"
                />
              </Box>
              {isPreventerPC && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mb: 0.5, color: "text.secondary" }}
                  >
                    Fortune +
                  </Typography>
                  <NumberField
                    name="fortuneBonus"
                    value={fortuneBonus}
                    onChange={e => {
                      const value = e.target.value
                      setFortuneBonus(value)
                      const isUsing = value !== "" && value !== "0"
                      setUsingFortune(isUsing)
                    }}
                    onBlur={e => {
                      const value = parseInt(e.target.value) || 0
                      const finalValue = value < 0 ? "0" : value.toString()
                      setFortuneBonus(finalValue)
                      const isUsing = finalValue !== "0"
                      setUsingFortune(isUsing)
                    }}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor:
                          fortuneBonus !== "0"
                            ? "warning.light"
                            : "background.paper",
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      mt: 0.5,
                      color: "text.secondary",
                    }}
                  >
                    {availableFortune} avail
                  </Typography>
                </Box>
              )}
              <Box sx={{ alignSelf: "center" }}>
                <Typography variant="body2">
                  vs Difficulty {CS.speed(selectedTarget)}
                </Typography>
              </Box>
            </Box>

            {/* Resolution Panel */}
            {speedCheckResult && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Resolution
                  </Typography>
                  <Alert
                    severity={speedCheckResult.success ? "success" : "warning"}
                  >
                    <Typography variant="body2">
                      <strong>
                        {speedCheckResult.success ? "Success!" : "Miss!"}
                      </strong>{" "}
                      Swerve {swerve >= 0 ? "" : ""}
                      {swerve} + Speed {speedCheckResult.preventerSpeed}
                      {speedCheckResult.fortuneBonusValue > 0 && (
                        <> + Fortune {speedCheckResult.fortuneBonusValue}</>
                      )}{" "}
                      = Result {speedCheckResult.totalRoll}. Result{" "}
                      {speedCheckResult.totalRoll} vs Target{" "}
                      {speedCheckResult.targetSpeed} ={" "}
                      {speedCheckResult.success ? "Success" : "Miss"}.
                    </Typography>
                  </Alert>
                </Box>
              </>
            )}

            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePreventEscape}
                disabled={submitting || !selectedPreventer || !selectedTarget}
                startIcon={<FaDice />}
              >
                {submitting ? "Processing..." : "Resolve"}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
