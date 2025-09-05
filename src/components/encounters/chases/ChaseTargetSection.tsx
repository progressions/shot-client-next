"use client"

import { useMemo, useEffect } from "react"
import {
  Box,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material"
import { VS, CS } from "@/services"
import type { ChaseFormData, Shot, Vehicle, Character } from "@/types"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"
import CharacterSelector from "../CharacterSelector"
import { TargetDisplay } from "@/components/encounters"
import VehicleStatsDisplay from "@/components/vehicles/VehicleStatsDisplay"

// Character with shot-specific data from encounter
interface CharacterWithShotData extends Character {
  driving_id?: string
  current_shot?: number | string | null
}

interface ChaseTargetSectionProps {
  shots: Shot[] // All shots from encounter
  vehicles: Vehicle[] // All vehicles from encounter
  formState: { data: ChaseFormData }
  dispatchForm: (action: {
    type: string
    name?: string
    value?: unknown
  }) => void
  target: Character | null // Character who is driving
  attacker: Character | null // Attacker character
  attackerShotId?: string
}

export default function ChaseTargetSection({
  shots,
  vehicles,
  formState,
  dispatchForm,
  target,
  attacker,
  attackerShotId,
}: ChaseTargetSectionProps) {
  const targetShotId = (
    formState.data as ChaseFormData & { targetShotId?: string }
  ).targetShotId
  const stunt = (formState.data as ChaseFormData & { stunt?: boolean }).stunt

  // Helper to update a field
  const updateField = (name: string, value: unknown) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name,
      value,
    })
  }

  // Check if attacker is friendly (PC or Ally)
  const attackerIsFriendly = useMemo(() => {
    if (!attacker) return false
    return CS.isType(attacker, ["PC", "Ally"])
  }, [attacker])

  // Filter shots to only include characters with driving_id, excluding the attacker
  const targetDriverShots = useMemo(() => {
    return shots.filter(shot => {
      // Exclude the attacker's shot
      if (shot.character && shot.character.shot_id === attackerShotId) {
        return false
      }
      if (
        shot.characters &&
        shot.characters.some((c: Character) => c.shot_id === attackerShotId)
      ) {
        return false
      }

      // Include only if character has driving_id
      if (shot.character) {
        return !!(shot.character as CharacterWithShotData).driving_id
      }
      if (shot.characters && shot.characters.length > 0) {
        return shot.characters.some(
          (c: Character) => !!(c as CharacterWithShotData).driving_id
        )
      }
      return false
    })
  }, [shots, attackerShotId])

  // Get the vehicle being driven by the selected target
  const selectedVehicle = useMemo(() => {
    if (!target || !target.driving) return null
    const drivingInfo = target.driving

    // Find the full vehicle data from vehicles array
    const fullVehicle = vehicles.find(v => v.id === drivingInfo.id)
    return fullVehicle || drivingInfo
  }, [target, vehicles])

  // Initialize targetCrunch when selectedVehicle changes
  useEffect(() => {
    if (selectedVehicle) {
      const currentCrunch = (
        formState.data as ChaseFormData & { targetCrunch?: string }
      ).targetCrunch
      const vehicleCrunch = VS.crunch(selectedVehicle)
      // Only update if not already set or if it's 0 when vehicle has a different value
      if (!currentCrunch || (currentCrunch === "0" && vehicleCrunch !== 0)) {
        updateField("targetCrunch", vehicleCrunch)
      }
    }
  }, [selectedVehicle])

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: "2px solid",
        borderBottomColor: "divider",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: "error.main" }}>
        🎯 Target
      </Typography>

      {/* Target Driver Selection */}
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CharacterSelector
            shots={targetDriverShots}
            selectedShotId={targetShotId}
            showShotNumbers={false}
            onSelect={shotId => {
              updateField("targetShotId", shotId)

              // Find the character that was selected
              const shot = shots.find(
                s =>
                  (s.character && s.character.shot_id === shotId) ||
                  (s.characters &&
                    s.characters.some((c: Character) => c.shot_id === shotId))
              )

              let selectedChar: Character | null = null
              if (shot) {
                if (shot.character && shot.character.shot_id === shotId) {
                  selectedChar = shot.character
                } else if (shot.characters) {
                  selectedChar =
                    shot.characters.find(
                      (c: Character) => c.shot_id === shotId
                    ) || null
                }
              }

              if (selectedChar && selectedChar.driving) {
                updateField("target", selectedChar)

                // Get the vehicle they're driving
                const drivingInfo = selectedChar.driving
                const vehicle =
                  vehicles.find(v => v.id === drivingInfo.id) || drivingInfo

                if (vehicle) {
                  // Update target vehicle-related fields
                  const targetDriving = CS.skill(selectedChar, "Driving")
                  const targetHandling = VS.handling(vehicle)
                  const targetFrame = VS.frame(vehicle)
                  const targetCrunch = VS.crunch(vehicle)

                  updateField("defense", targetDriving) // Target's Driving is the difficulty
                  updateField("handling", targetHandling) // Target's Handling for chase point calculation
                  updateField("frame", targetFrame) // Target's Frame for damage calculation
                  updateField("targetCrunch", targetCrunch) // Target's Crunch for ram calculation
                  updateField("targetVehicle", vehicle) // Store the vehicle reference
                }
              }
            }}
            borderColor="error.main"
            excludeShotId={attackerShotId}
            showAllCheckbox={true}
            filterFunction={(character: Character) => {
              // Filter based on attacker's allegiance
              if (attackerIsFriendly) {
                // If attacker is friendly, exclude other friendlies from targets
                return !CS.isType(character, ["PC", "Ally"])
              } else {
                // If attacker is NOT friendly, only include PCs/Allies as targets
                return CS.isType(character, ["PC", "Ally"])
              }
            }}
          />

          {/* Display selected target */}
          {target && (
            <Box sx={{ mt: 2 }}>
              <TargetDisplay character={target} />
            </Box>
          )}
        </Box>
      </Stack>

      {/* Show message if no targets available */}
      {targetDriverShots.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No vehicles with drivers available as targets.
        </Typography>
      )}

      {/* Target Vehicle Details */}
      {target && selectedVehicle && (
        <>
          {/* Vehicle Info Display with Editable Values */}
          <Box
            sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2 }}
          >
            <Stack direction="row" spacing={3}>
              {/* Vehicle Stats Display */}
              <Box sx={{ flex: 1 }}>
                <VehicleStatsDisplay vehicle={selectedVehicle} />
              </Box>

              {/* Editable Defense Values */}
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {/* Driving Value */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: "medium" }}
                  >
                    Driving
                  </Typography>
                  <NumberField
                    name="defense"
                    value={
                      parseInt(formState.data.defense?.toString() || "0") || 0
                    }
                    size="small"
                    width="80px"
                    error={false}
                    onChange={e => updateField("defense", e.target.value)}
                    onBlur={e => updateField("defense", e.target.value)}
                  />
                </Box>

                {/* Handling Value */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: "medium" }}
                  >
                    Handling
                  </Typography>
                  <NumberField
                    name="handling"
                    value={
                      parseInt(formState.data.handling?.toString() || "0") || 0
                    }
                    size="small"
                    width="80px"
                    error={false}
                    onChange={e => updateField("handling", e.target.value)}
                    onBlur={e => updateField("handling", e.target.value)}
                  />
                </Box>

                {/* Frame Value (editable) */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: "medium" }}
                  >
                    Frame
                  </Typography>
                  <NumberField
                    name="frame"
                    value={
                      parseInt(formState.data.frame?.toString() || "0") || 0
                    }
                    size="small"
                    width="80px"
                    error={false}
                    onChange={e => updateField("frame", e.target.value)}
                    onBlur={e => updateField("frame", e.target.value)}
                  />
                </Box>

                {/* Crunch Value (editable) */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontWeight: "medium" }}
                  >
                    Crunch
                  </Typography>
                  <NumberField
                    name="targetCrunch"
                    value={
                      parseInt(
                        (
                          formState.data as ChaseFormData & {
                            targetCrunch?: string
                          }
                        ).targetCrunch?.toString() || "0"
                      ) || 0
                    }
                    size="small"
                    width="80px"
                    error={false}
                    onChange={e => updateField("targetCrunch", e.target.value)}
                    onBlur={e => updateField("targetCrunch", e.target.value)}
                  />
                </Box>
              </Stack>
            </Stack>
          </Box>

          {/* Stunt Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={stunt || false}
                onChange={e => {
                  const isChecked = e.target.checked
                  updateField("stunt", isChecked)

                  // Update defense value when stunt is toggled
                  const currentDefense =
                    parseInt(formState.data.defense?.toString() || "0") || 0
                  if (isChecked) {
                    // Add 2 when stunt is checked
                    updateField("defense", currentDefense + 2)
                  } else {
                    // Subtract 2 when stunt is unchecked
                    updateField("defense", Math.max(0, currentDefense - 2))
                  }
                }}
              />
            }
            label="Stunt (+2 Defense)"
            sx={{ ml: 1 }}
          />
        </>
      )}
    </Box>
  )
}
