"use client"

import React, { useState, useMemo } from "react"
import { Box, Typography, Button, Alert, Divider } from "@mui/material"
import { FaDice } from "react-icons/fa6"
import { useEncounter, useToast, useClient } from "@/contexts"
import { CS } from "@/services"
import { CharacterLink } from "@/components/ui/links"
import { Avatar } from "@/components/avatars"
import { NumberField } from "@/components/ui"
import { getAllVisibleShots } from "./attacks/shotSorting"
import TargetSelector from "./TargetSelector"
import BasePanel from "./BasePanel"
import type { Character } from "@/types"

interface SpeedCheckPanelProps {
  selectedCharacter: Character | null
  onComplete?: () => void
}

export default function SpeedCheckPanel({
  selectedCharacter,
  onComplete,
}: SpeedCheckPanelProps) {
  const { encounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()
  const [submitting, setSubmitting] = useState(false)
  const [selectedTargetShotId, setSelectedTargetShotId] = useState<string>("")
  const [swerve, setSwerve] = useState<number>(0)
  const [fortuneBonus, setFortuneBonus] = useState<string>("0")
  const [shotCost, setShotCost] = useState<number>(3)

  // The selected character from the encounter is the preventer
  const selectedPreventer = selectedCharacter

  // Check if preventer is a PC and get available Fortune
  const isPreventerPC = selectedPreventer && CS.isPC(selectedPreventer)
  const availableFortune = isPreventerPC
    ? CS.fortune(selectedPreventer) || 0
    : 0

  // Check if preventer is Boss or Uber-Boss for shot cost default
  const isBossType =
    selectedPreventer &&
    (CS.type(selectedPreventer) === "Boss" ||
      CS.type(selectedPreventer) === "Uber-Boss")

  // Update shot cost when selected preventer changes
  React.useEffect(() => {
    if (selectedPreventer) {
      // Boss and Uber-Boss characters default to 2 shots, others default to 3
      const defaultShotCost = isBossType ? 2 : 3
      setShotCost(defaultShotCost)
    }
  }, [selectedPreventer, isBossType])

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

      // Get the preventer's current shot position
      const preventerShot = allShots.find(
        s => s.character?.id === selectedPreventer.id
      )
      const currentPreventerShot = preventerShot?.shot || 0

      // Calculate new shot position after spending shots
      const newPreventerShot = Math.max(-10, currentPreventerShot - shotCost)

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
        // First, update the preventer's shot position
        if (shotCost > 0) {
          characterUpdates.push({
            shot_id: selectedPreventer.shot_id,
            character_id: selectedPreventer.id,
            shot: newPreventerShot,
            event: {
              type: "speed_check_attempt",
              description: `${selectedPreventer.name} spends ${shotCost} shots on Speed Check`,
              details: {
                character_id: selectedPreventer.id,
                shot_cost: shotCost,
                old_shot: currentPreventerShot,
                new_shot: newPreventerShot,
              },
            },
          })
        }

        // Then update the target's status
        characterUpdates.push({
          shot_id: targetEscaper.shot_id,
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
              shot_cost: shotCost,
              difficulty: escapeeDifficulty,
              success: true,
            },
          },
        })
        toastSuccess(`${selectedPreventer.name} prevents the escape!`)
      } else {
        // Prevention fails - escapee becomes "cheesed_it"
        // First, update the preventer's shot position (they still spend shots even on failure)
        if (shotCost > 0) {
          characterUpdates.push({
            shot_id: selectedPreventer.shot_id,
            character_id: selectedPreventer.id,
            shot: newPreventerShot,
            event: {
              type: "speed_check_attempt",
              description: `${selectedPreventer.name} spends ${shotCost} shots on Speed Check`,
              details: {
                character_id: selectedPreventer.id,
                shot_cost: shotCost,
                old_shot: currentPreventerShot,
                new_shot: newPreventerShot,
              },
            },
          })
        }

        // Then update the target's status
        characterUpdates.push({
          shot_id: targetEscaper.shot_id,
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
              shot_cost: shotCost,
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
      <BasePanel title="Speed Check" icon={<FaDice />} borderColor="info.main">
        <Alert severity="info">
          No characters are currently attempting to escape.
        </Alert>
      </BasePanel>
    )
  }

  return (
    <BasePanel
      title="Speed Check - Prevent Escape"
      icon={<FaDice />}
      borderColor="warning.main"
    >
      {/* Two-column layout */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Left column - Target Selection */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Select Escaping Character to Target:
          </Typography>
          <TargetSelector
            allShots={allShots}
            selectedIds={selectedTargetShotId}
            onSelectionChange={setSelectedTargetShotId}
            borderColor="warning.main"
            disabled={submitting}
            showShotNumbers={true}
            filterFunction={character =>
              !!character.status?.includes("cheesing_it")
            }
          >
            {([selectedTarget]) =>
              selectedTarget ? (
                <Box
                  sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Avatar
                    character={selectedTarget}
                    hideVehicle
                    size={48}
                    showImpairments
                  />
                  <Box>
                    <CharacterLink character={selectedTarget} />
                    <Typography variant="body2" color="text.secondary">
                      Speed: {CS.speed(selectedTarget as Character)}{" "}
                      (Difficulty)
                    </Typography>
                  </Box>
                </Box>
              ) : null
            }
          </TargetSelector>
        </Box>

        {/* Right column - Speed Check Resolution */}
        {selectedPreventer && selectedTarget && (
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Box>
                <NumberField
                  name="swerve"
                  label="Swerve"
                  value={swerve}
                  onChange={e => setSwerve(parseInt(e.target.value) || 0)}
                  onBlur={e => setSwerve(parseInt(e.target.value) || 0)}
                  size="small"
                  labelBackgroundColor="#202020"
                />
              </Box>
              {isPreventerPC && (
                <Box>
                  <NumberField
                    name="fortuneBonus"
                    label="Fortune +"
                    value={fortuneBonus}
                    onChange={e => {
                      const value = e.target.value
                      setFortuneBonus(value)
                    }}
                    onBlur={e => {
                      const value = parseInt(e.target.value) || 0
                      const finalValue = value < 0 ? "0" : value.toString()
                      setFortuneBonus(finalValue)
                    }}
                    size="small"
                    labelBackgroundColor="#202020"
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
              <Box>
                <NumberField
                  name="shotCost"
                  label="Shots"
                  value={shotCost}
                  onChange={e => setShotCost(parseInt(e.target.value) || 0)}
                  onBlur={e => setShotCost(parseInt(e.target.value) || 0)}
                  size="small"
                  labelBackgroundColor="#202020"
                  sx={{
                    width: 80,
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: isBossType
                        ? "info.light"
                        : "background.paper",
                    },
                  }}
                />
              </Box>
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
    </BasePanel>
  )
}
