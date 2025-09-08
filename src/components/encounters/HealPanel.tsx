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
} from "@mui/material"
import { FaHeartPulse } from "react-icons/fa6"
import { useEncounter, useToast, useClient } from "@/contexts"
import { CS } from "@/services"
import { NumberField } from "@/components/ui"
import TargetSelector from "./TargetSelector"
import { TargetDisplay } from "@/components/encounters"
import BasePanel from "./BasePanel"
import { getAllVisibleShots } from "./attacks/shotSorting"
import type { Character } from "@/types"

interface HealPanelProps {
  onComplete?: () => void
  preselectedCharacter?: Character
}

export default function HealPanel({
  onComplete,
  preselectedCharacter,
}: HealPanelProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()

  // Form state
  const [targetShotId, setTargetShotId] = useState("")
  const [medicineValue, setMedicineValue] = useState("7")
  const [swerve, setSwerve] = useState("0")
  const [shotsSpent, setShotsSpent] = useState("5")
  const [useFortune, setUseFortune] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Delay rendering for animation
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Get all characters in the fight
  const allShots = useMemo(() => {
    if (!encounter?.shots) return []
    return getAllVisibleShots(encounter.shots)
  }, [encounter?.shots])

  // Initialize medicine value when character changes
  useEffect(() => {
    if (preselectedCharacter?.action_values) {
      const skill = preselectedCharacter.action_values["Medicine"] || 7
      setMedicineValue(skill.toString())
    } else {
      setMedicineValue("7")
    }
  }, [preselectedCharacter])

  // Get selected target
  const targetShot = allShots.find(s => s.character?.shot_id === targetShotId)
  const target = targetShot?.character

  // Calculate healing amount
  const healingAmount = useMemo(() => {
    const medicineNum = parseInt(medicineValue, 10) || 7
    const swerveValue = parseInt(swerve, 10) || 0
    return Math.max(0, medicineNum + swerveValue)
  }, [medicineValue, swerve])

  const handleApplyHeal = async () => {
    if (!preselectedCharacter) {
      toastError("No healer selected")
      return
    }

    if (!target) {
      toastError("No target selected")
      return
    }

    if (!encounter) {
      toastError("No active encounter")
      return
    }

    setIsProcessing(true)

    try {
      const currentWounds = CS.wounds(target)
      const newWounds = Math.max(0, currentWounds - healingAmount)
      const actualHealing = currentWounds - newWounds
      const shots = parseInt(shotsSpent) || 5

      // Find healer's shot
      const healerShot = allShots.find(
        s => s.character?.shot_id === preselectedCharacter.shot_id
      )

      if (!healerShot) {
        toastError("Could not find healer in initiative order")
        return
      }

      // Build character updates array
      interface CharacterUpdate {
        shot_id: string
        character_id: string
        shot?: number
        event?: {
          type: string
          description: string
          details: Record<string, unknown>
        }
        action_values?: Record<string, number>
        wounds?: number
        count?: number
      }

      const characterUpdates: CharacterUpdate[] = []

      // Healer spends shots and optionally Fortune
      const healerUpdate: CharacterUpdate = {
        shot_id: preselectedCharacter.shot_id,
        character_id: preselectedCharacter.id,
        shot: healerShot.shot - shots,
        event: {
          type: "heal",
          description: `${preselectedCharacter.name} healed ${target.name} for ${actualHealing} wound${actualHealing !== 1 ? "s" : ""}`,
          details: {
            healer_id: preselectedCharacter.id,
            target_id: target.id,
            medicine_skill: parseInt(medicineValue),
            swerve: parseInt(swerve),
            healing: actualHealing,
            shot_cost: shots,
            fortune_used: useFortune,
          },
        },
      }

      // If using Fortune, update action_values for PCs
      if (useFortune && CS.isPC(preselectedCharacter)) {
        const currentFortune = CS.fortune(preselectedCharacter)
        if (currentFortune > 0) {
          healerUpdate.action_values = {
            Fortune: currentFortune - 1,
          }
        }
      }

      characterUpdates.push(healerUpdate)

      // Target's wounds are reduced
      const targetUpdate: CharacterUpdate = {
        shot_id: target.shot_id,
        character_id: target.id,
      }

      // For PCs, wounds go in action_values
      if (CS.isPC(target)) {
        targetUpdate.action_values = {
          Wounds: newWounds,
        }
      } else {
        // For NPCs and mooks, wounds go directly on the update
        if (CS.isMook(target)) {
          targetUpdate.count = newWounds
        } else {
          targetUpdate.wounds = newWounds
        }
      }

      characterUpdates.push(targetUpdate)

      // Apply the healing action
      await client.applyCombatAction(encounter, characterUpdates)

      toastSuccess(
        `${preselectedCharacter.name} healed ${target.name} for ${actualHealing} wound${actualHealing !== 1 ? "s" : ""} (Medicine ${medicineValue} + Swerve ${swerve})`
      )

      // Reset form and close panel
      setTargetShotId("")
      setSwerve("0")
      setMedicineValue("7")
      setShotsSpent("5")
      setUseFortune(false)
      if (onComplete) onComplete()
    } catch (error) {
      console.error("Failed to apply healing:", error)
      toastError("Failed to apply healing")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <BasePanel title="Heal" icon={<FaHeartPulse />} borderColor="success.main">
      {isReady ? (
        <>
          {/* Combined Healer and Target Section */}
          <Box sx={{ backgroundColor: "action.hover" }}>
            <Box
              sx={{
                p: { xs: 1, sm: 1.5 },
                borderBottom: "2px solid",
                borderBottomColor: "divider",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: 2, md: 3 },
              }}
            >
              {/* Left Side - Healer Info */}
              <Box sx={{ flex: "0 0 auto" }}>
                <Typography variant="h6" sx={{ mb: 1, color: "success.main" }}>
                  💉 Healer
                </Typography>

                {preselectedCharacter ? (
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {preselectedCharacter.name}
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}
                    >
                      <Box sx={{ width: 100 }}>
                        <NumberField
                          label="Medicine Skill"
                          value={medicineValue}
                          onChange={e => setMedicineValue(e.target.value)}
                          onBlur={() => {
                            if (!medicineValue || medicineValue === "0") {
                              setMedicineValue("7")
                            }
                          }}
                          min={0}
                          max={20}
                          disabled={isProcessing}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ width: 100 }}>
                        <NumberField
                          label="Shot Cost"
                          value={shotsSpent}
                          onChange={e => setShotsSpent(e.target.value)}
                          onBlur={() => {
                            if (!shotsSpent || parseInt(shotsSpent) < 1) {
                              setShotsSpent("5")
                            }
                          }}
                          min={1}
                          max={10}
                          disabled={isProcessing}
                          size="small"
                        />
                      </Box>
                    </Box>
                    {CS.isPC(preselectedCharacter) && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={useFortune}
                            onChange={e => setUseFortune(e.target.checked)}
                            disabled={
                              isProcessing ||
                              CS.fortune(preselectedCharacter) <= 0
                            }
                          />
                        }
                        label={`Use Fortune (${CS.fortune(preselectedCharacter)} available)`}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    No healer selected
                  </Typography>
                )}
              </Box>

              {/* Right Side - Target Selection */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 1, color: "error.main" }}>
                  🎯 Healing Target
                </Typography>
                <TargetSelector
                  allShots={allShots}
                  selectedIds={targetShotId}
                  onSelectionChange={selected => setTargetShotId(selected as string)}
                  borderColor="error.main"
                  disabled={isProcessing}
                  showShotNumbers={false}
                  characterTypes={["Ally", "PC"]}
                >
                  {([selectedTarget]) =>
                    selectedTarget ? (
                      <Box sx={{ mt: 1 }}>
                        <TargetDisplay character={selectedTarget as Character} />
                      </Box>
                    ) : null
                  }
                </TargetSelector>
              </Box>
            </Box>
          </Box>

          {/* Healing Resolution Section */}
          <Box
            sx={{ p: { xs: 2, sm: 3 }, backgroundColor: "background.default" }}
          >
            {preselectedCharacter ? (
              <>
                {/* Swerve and Results Container */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Swerve Input */}
                  <Box sx={{ width: 100, flexShrink: 0 }}>
                    <NumberField
                      label="Swerve"
                      value={swerve}
                      onChange={e => setSwerve(e.target.value)}
                      onBlur={() => {}}
                      min={-10}
                      max={10}
                      disabled={isProcessing}
                      size="small"
                    />
                  </Box>

                  {/* Healing Summary */}
                  {target && (
                    <Alert severity="info" sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        <strong>{preselectedCharacter.name}</strong> will heal{" "}
                        <strong>{target.name}</strong> for{" "}
                        <strong>
                          {Math.min(healingAmount, CS.wounds(target))}
                        </strong>{" "}
                        wounds
                        {healingAmount > CS.wounds(target) &&
                        CS.wounds(target) > 0 ? (
                          <> (limited by current wounds)</>
                        ) : null}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 1 }}
                      >
                        Medicine ({medicineValue}) + Swerve ({swerve}) ={" "}
                        {healingAmount} wounds healed
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block" }}>
                        Cost: {shotsSpent} shots{useFortune && " + 1 Fortune"}
                      </Typography>
                    </Alert>
                  )}

                  {!target && (
                    <Alert severity="warning" sx={{ flex: 1 }}>
                      Select a target to heal
                    </Alert>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a healer with Medicine skill
                </Typography>
              </Box>
            )}

            {/* Action Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleApplyHeal}
                disabled={!preselectedCharacter || !target || isProcessing}
                startIcon={isProcessing && <CircularProgress size={20} />}
                color="success"
              >
                {isProcessing
                  ? "APPLYING..."
                  : `✓ APPLY HEALING (${shotsSpent} SHOTS)`}
              </Button>
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      )}
    </BasePanel>
  )
}
