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
import { useEncounter, useToast, useClient } from "@/contexts"
import { CS } from "@/services"
import { NumberField } from "@/components/ui"
import CharacterSelector from "./CharacterSelector"
import { TargetDisplay } from "@/components/encounters"
import { getAllVisibleShots } from "./attacks/shotSorting"
import type { Character } from "@/types"

interface HealPanelProps {
  onClose?: () => void
  onComplete?: () => void
  preselectedCharacter?: Character
}

export default function HealPanel({ onClose, onComplete, preselectedCharacter }: HealPanelProps) {
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
  const targetShot = allShots.find(
    s => s.character?.shot_id === targetShotId
  )
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
      const characterUpdates = []
      
      // Healer spends shots and optionally Fortune
      const healerUpdate: any = {
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
      const targetUpdate: any = {
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
      if (onClose) onClose()
    } catch (error) {
      console.error("Failed to apply healing:", error)
      toastError("Failed to apply healing")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box sx={{ overflow: "hidden", minHeight: isReady ? "auto" : "100px" }}>
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        Healing Action
      </Typography>

      {isReady ? (
        <>
          {/* Healer Info Section */}
          <Box sx={{ backgroundColor: "action.hover" }}>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderBottom: "2px solid",
                borderBottomColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: "success.main" }}>
                💉 Healer
              </Typography>
              
              {preselectedCharacter ? (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {preselectedCharacter.name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
                    <Box sx={{ width: 100 }}>
                      <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
                        Medicine Skill
                      </Typography>
                      <NumberField
                        label=""
                        value={medicineValue}
                        onChange={(e) => setMedicineValue(e.target.value)}
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
                      <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
                        Shots to Spend
                      </Typography>
                      <NumberField
                        label=""
                        value={shotsSpent}
                        onChange={(e) => setShotsSpent(e.target.value)}
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={useFortune}
                        onChange={(e) => setUseFortune(e.target.checked)}
                        disabled={isProcessing || CS.fortune(preselectedCharacter) <= 0}
                      />
                    }
                    label={`Use Fortune (${CS.fortune(preselectedCharacter)} available)`}
                    sx={{ mt: 1 }}
                  />
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No healer selected
                </Typography>
              )}
            </Box>

            {/* Target Selection Section */}
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderBottom: "2px solid",
                borderBottomColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: "error.main" }}>
                🎯 Healing Target
              </Typography>
              <CharacterSelector
                shots={allShots}
                selectedShotId={targetShotId}
                onSelect={setTargetShotId}
                borderColor="error.main"
                disabled={isProcessing}
                showShotNumbers={false}
                characterTypes={["Ally", "PC"]}
                showAllCheckbox={true}
              />
              {target && (
                <Box sx={{ mt: 2 }}>
                  <TargetDisplay character={target} />
                </Box>
              )}
            </Box>
          </Box>

          {/* Healing Resolution Section */}
          <Box
            sx={{ p: { xs: 2, sm: 3 }, backgroundColor: "background.default" }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}
            >
              💊 Healing Resolution
            </Typography>

            {preselectedCharacter ? (
              <>
                {/* Swerve Input */}
                <Box sx={{ mb: 3, width: 100, mx: "auto" }}>
                  <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
                    Swerve
                  </Typography>
                  <NumberField
                    label=""
                    value={swerve}
                    onChange={(e) => setSwerve(e.target.value)}
                    onBlur={() => {}}
                    min={-10}
                    max={10}
                    disabled={isProcessing}
                    size="small"
                  />
                </Box>

                {/* Healing Summary */}
                {target && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>{preselectedCharacter.name}</strong> will heal{" "}
                      <strong>{target.name}</strong> for{" "}
                      <strong>{Math.min(healingAmount, CS.wounds(target))}</strong> wounds
                      {healingAmount > CS.wounds(target) && CS.wounds(target) > 0 ? (
                        <> (limited by current wounds)</>
                      ) : null}
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                      Medicine ({medicineValue}) + Swerve ({swerve}) = {healingAmount} wounds healed
                    </Typography>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      Cost: {shotsSpent} shots{useFortune && " + 1 Fortune"}
                    </Typography>
                  </Alert>
                )}

                {!target && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Select a target to heal
                  </Alert>
                )}
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
                startIcon={
                  isProcessing && <CircularProgress size={20} />
                }
                color="success"
              >
                {isProcessing ? "APPLYING..." : `✓ APPLY HEALING (${shotsSpent} SHOTS)`}
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