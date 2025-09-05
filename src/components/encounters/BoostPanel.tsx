"use client"

import { useMemo, useEffect, useState } from "react"
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Alert,
  CircularProgress,
} from "@mui/material"
import { useEncounter, useToast, useClient } from "@/contexts"
import { CS } from "@/services"
import CharacterSelector from "./CharacterSelector"
import { TargetDisplay } from "@/components/encounters"
import type { Character } from "@/types"
import { getAllVisibleShots } from "./attacks/shotSorting"

interface BoostPanelProps {
  onClose?: () => void
}

interface BoostFormData {
  boosterShotId: string
  targetShotId: string
  boostType: "attack" | "defense" | ""
  useFortune: boolean
  isProcessing: boolean
}

interface ExtendedBoostPanelProps {
  onClose?: () => void
  onComplete?: () => void
  preselectedBooster?: Character
}

export default function BoostPanel({
  onClose,
  onComplete,
  preselectedBooster,
}: ExtendedBoostPanelProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()

  // Form state
  const [formData, setFormData] = useState<BoostFormData>({
    boosterShotId: preselectedBooster?.shot_id || "",
    targetShotId: "",
    boostType: "",
    useFortune: false,
    isProcessing: false,
  })

  // Delay rendering for animation
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Get all characters in the fight
  const allShots = useMemo(
    () => getAllVisibleShots(encounter.shots),
    [encounter.shots]
  )

  // Sort booster shots by position (higher first), prioritizing PCs/Allies
  const sortedBoosterShots = useMemo(() => {
    return [...allShots].sort((a, b) => {
      // First by shot position (higher is better)
      const shotDiff = b.shot - a.shot
      if (shotDiff !== 0) return shotDiff

      // Then prioritize PCs and Allies
      const aChar = a.character || a.vehicle
      const bChar = b.character || b.vehicle
      if (aChar && bChar) {
        const aType = CS.type(aChar as Character)
        const bType = CS.type(bChar as Character)
        const aIsGoodGuy = aType === "PC" || aType === "Ally"
        const bIsGoodGuy = bType === "PC" || bType === "Ally"
        if (aIsGoodGuy && !bIsGoodGuy) return -1
        if (!aIsGoodGuy && bIsGoodGuy) return 1
      }

      return 0
    })
  }, [allShots])

  // Get selected booster
  const boosterShot = allShots.find(
    s =>
      s.character?.shot_id === formData.boosterShotId ||
      s.vehicle?.shot_id === formData.boosterShotId
  )
  const booster = boosterShot?.character || boosterShot?.vehicle

  // Get valid targets - show all when no booster, filter when booster selected
  const validTargetShots = useMemo(() => {
    if (!booster) {
      // Show all shots when no booster selected (matching AttackPanel behavior)
      return allShots
    }

    // If booster is selected, filter based on booster type
    const boosterType = CS.type(booster as Character)
    const isBoosterGoodGuy = boosterType === "PC" || boosterType === "Ally"

    return allShots.filter(shot => {
      const target = shot.character || shot.vehicle
      if (!target) return false

      // Can't boost yourself
      if (target.shot_id === formData.boosterShotId) return false

      // Apply targeting rules similar to AttackPanel
      if (isBoosterGoodGuy) {
        // Good guys typically boost other good guys
        const targetType = CS.type(target as Character)
        return targetType === "PC" || targetType === "Ally"
      } else {
        // Bad guys can boost other bad guys
        const targetType = CS.type(target as Character)
        return !(targetType === "PC" || targetType === "Ally")
      }
    })
  }, [allShots, booster, formData.boosterShotId])

  // Get selected target
  const targetShot = allShots.find(
    s =>
      s.character?.shot_id === formData.targetShotId ||
      s.vehicle?.shot_id === formData.targetShotId
  )
  const target = targetShot?.character || targetShot?.vehicle

  // Check if booster is a PC (can use Fortune)
  const canUseFortune = booster && CS.type(booster as Character) === "PC"

  // Handle form field changes
  const handleFieldChange = (
    field: keyof BoostFormData,
    value: string | boolean | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle booster selection
  const handleBoosterSelect = (shotId: string) => {
    handleFieldChange("boosterShotId", shotId)
    // Reset target and fortune when booster changes
    handleFieldChange("targetShotId", "")
    handleFieldChange("useFortune", false)
  }

  // Handle target selection
  const handleTargetSelect = (shotId: string) => {
    handleFieldChange("targetShotId", shotId)
  }

  // Handle boost type change
  const handleBoostTypeChange = (type: string) => {
    handleFieldChange("boostType", type)
  }

  // Handle Fortune toggle
  const handleFortuneToggle = () => {
    if (!canUseFortune) return

    const character = booster as Character
    const currentFortune = character.action_values?.Fortune || 0

    if (!formData.useFortune && currentFortune < 1) {
      toastError("Insufficient Fortune points")
      return
    }

    handleFieldChange("useFortune", !formData.useFortune)
  }

  // Calculate boost value
  const getBoostValue = () => {
    if (!formData.boostType) return 0

    const baseValues = {
      attack: { base: 1, fortune: 2 },
      defense: { base: 3, fortune: 5 },
    }

    const boostConfig = baseValues[formData.boostType]
    return formData.useFortune ? boostConfig.fortune : boostConfig.base
  }

  // Handle apply boost
  const handleApplyBoost = async () => {
    if (!booster || !target || !formData.boostType) {
      toastError("Please select booster, target, and boost type")
      return
    }

    handleFieldChange("isProcessing", true)

    try {
      // Call the API to apply the boost
      await client.applyBoostAction(
        encounter.id,
        booster.id,
        target.id,
        formData.boostType,
        formData.useFortune
      )

      const boostValue = getBoostValue()
      const boostTypeLabel =
        formData.boostType === "attack" ? "Attack" : "Defense"
      const fortuneLabel = formData.useFortune ? " (Fortune enhanced)" : ""

      toastSuccess(
        `${booster.name} boosted ${target.name}'s ${boostTypeLabel} by +${boostValue}${fortuneLabel}`
      )

      // Reset form and close panel
      setFormData({
        boosterShotId: "",
        targetShotId: "",
        boostType: "",
        useFortune: false,
        isProcessing: false,
      })

      if (onComplete) onComplete()
      if (onClose) onClose()
    } catch (error) {
      console.error("Failed to apply boost:", error)
      toastError("Failed to apply boost")
      handleFieldChange("isProcessing", false)
    }
  }

  // Check if form is valid
  const isFormValid =
    formData.boosterShotId && formData.targetShotId && formData.boostType

  return (
    <Box sx={{ overflow: "hidden", minHeight: isReady ? "auto" : "100px" }}>
      {/* Panel Heading */}
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
        Boost
      </Typography>
      
      {/* Main Content - Attacker then Target */}
      {isReady ? (
        <>
          <Box sx={{ backgroundColor: "action.hover" }}>
            {/* Booster Section - Only show if not preselected */}
            {!preselectedBooster && (
              <Box
                sx={{
                  p: { xs: 1, sm: 1.5 },
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, color: "primary.main" }}>
                  💪 Booster
                </Typography>
                <CharacterSelector
                  shots={sortedBoosterShots}
                  selectedShotId={formData.boosterShotId}
                  onSelect={handleBoosterSelect}
                  borderColor="primary.main"
                  disabled={formData.isProcessing}
                />
              </Box>
            )}

            {/* Target Section */}
            <Box
              sx={{
                p: { xs: 1, sm: 1.5 },
                borderBottom: "2px solid",
                borderBottomColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, color: "error.main" }}>
                🎯 Target
              </Typography>
              <CharacterSelector
                shots={validTargetShots}
                selectedShotId={formData.targetShotId}
                onSelect={handleTargetSelect}
                borderColor="error.main"
                disabled={formData.isProcessing}
                excludeShotId={formData.boosterShotId}
                showShotNumbers={false}
              />
              {target && (
                <Box sx={{ mt: 1 }}>
                  <TargetDisplay character={target as Character} />
                </Box>
              )}
            </Box>
          </Box>

          {/* Bottom Section - Boost Resolution */}
          <Box
            sx={{ p: { xs: 1, sm: 1.5 }, backgroundColor: "background.default" }}
          >
            {booster && target ? (
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                {/* Left Side - Boost Type Selection */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: "medium" }}>
                    Boost Type (3 shots)
                  </Typography>
                  <ButtonGroup 
                    orientation="vertical" 
                    variant="contained"
                    size="small"
                    sx={{ width: 160 }}
                  >
                    <Button
                      onClick={() => handleBoostTypeChange("attack")}
                      disabled={formData.isProcessing}
                      variant={formData.boostType === "attack" ? "contained" : "outlined"}
                      sx={{ 
                        justifyContent: "flex-start", 
                        pl: 2,
                        ...(formData.boostType === "attack" && {
                          backgroundColor: "primary.dark",
                          "&:hover": {
                            backgroundColor: "primary.dark"
                          }
                        })
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          Attack
                        </Typography>
                        <Typography>
                          +{formData.useFortune ? "2" : "1"}
                        </Typography>
                      </Box>
                    </Button>
                    <Button
                      onClick={() => handleBoostTypeChange("defense")}
                      disabled={formData.isProcessing}
                      variant={formData.boostType === "defense" ? "contained" : "outlined"}
                      sx={{ 
                        justifyContent: "flex-start", 
                        pl: 2,
                        ...(formData.boostType === "defense" && {
                          backgroundColor: "primary.dark",
                          "&:hover": {
                            backgroundColor: "primary.dark"
                          }
                        })
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          Defense
                        </Typography>
                        <Typography>
                          +{formData.useFortune ? "5" : "3"}
                        </Typography>
                      </Box>
                    </Button>
                  </ButtonGroup>

                  {/* Fortune Enhancement (PC only) */}
                  {canUseFortune && formData.boostType && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant={formData.useFortune ? "contained" : "outlined"}
                        onClick={handleFortuneToggle}
                        disabled={formData.isProcessing}
                        color="secondary"
                        size="small"
                        fullWidth
                      >
                        {formData.useFortune
                          ? "✨ Fortune"
                          : "Use Fortune"}
                      </Button>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 0.5, textAlign: "center" }}
                      >
                        {(booster as Character).action_values?.Fortune || 0} available
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Right Side - Boost Summary */}
                <Box sx={{ flex: 1 }}>
                  {formData.boostType ? (
                    <Alert severity="info">
                      <Typography variant="body2">
                        <strong>{booster.name}</strong> will spend 3 shots to
                        boost <strong>{target.name}&apos;s</strong>{" "}
                        {formData.boostType === "attack" ? "Attack" : "Defense"}{" "}
                        by <strong>+{getBoostValue()}</strong>
                        {formData.useFortune && " (Fortune enhanced)"}
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="warning">
                      Select a boost type
                    </Alert>
                  )}
                </Box>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a booster and target to apply a boost
                </Typography>
              </Box>
            )}

            {/* Action Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleApplyBoost}
                disabled={!isFormValid || formData.isProcessing}
                startIcon={
                  formData.isProcessing && <CircularProgress size={20} />
                }
                sx={{
                  backgroundColor: isFormValid
                    ? "primary.main"
                    : "action.disabled",
                  "&:hover": {
                    backgroundColor: isFormValid
                      ? "primary.dark"
                      : "action.disabled",
                  },
                }}
              >
                {formData.isProcessing ? "APPLYING..." : "✓ APPLY"}
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
