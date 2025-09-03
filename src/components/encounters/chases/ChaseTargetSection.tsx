"use client"

import { useMemo } from "react"
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
import CharacterSelector from "../CharacterSelector"

interface ChaseTargetSectionProps {
  shots: Shot[]  // All shots from encounter
  vehicles: Vehicle[]  // All vehicles from encounter
  formState: { data: ChaseFormData }
  dispatchForm: (action: any) => void
  target: Character | null  // Character who is driving
  attackerShotId?: string
}

export default function ChaseTargetSection({
  shots,
  vehicles,
  formState,
  dispatchForm,
  target,
  attackerShotId,
}: ChaseTargetSectionProps) {
  const { targetShotId, stunt } = formState.data as any

  // Helper to update a field
  const updateField = (name: string, value: unknown) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name,
      value,
    })
  }

  // Filter shots to only include characters with driving_id, excluding the attacker
  const targetDriverShots = useMemo(() => {
    return shots.filter(shot => {
      // Exclude the attacker's shot
      if (shot.character && shot.character.shot_id === attackerShotId) {
        return false
      }
      if (shot.characters && shot.characters.some((c: Character) => c.shot_id === attackerShotId)) {
        return false
      }
      
      // Include only if character has driving_id
      if (shot.character) {
        return !!(shot.character as any).driving_id
      }
      if (shot.characters && shot.characters.length > 0) {
        return shot.characters.some((c: Character) => !!(c as any).driving_id)
      }
      return false
    })
  }, [shots, attackerShotId])


  // Get the vehicle being driven by the selected target
  const selectedVehicle = useMemo(() => {
    if (!target || !(target as any).driving) return null
    const drivingInfo = (target as any).driving
    
    // Find the full vehicle data from vehicles array
    const fullVehicle = vehicles.find(v => v.id === drivingInfo.id)
    return fullVehicle || drivingInfo
  }, [target, vehicles])

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
            onSelect={(shotId) => {
              updateField("targetShotId", shotId)
              
              // Find the character that was selected
              const shot = shots.find(s => 
                (s.character && s.character.shot_id === shotId) ||
                (s.characters && s.characters.some((c: Character) => c.shot_id === shotId))
              )
              
              let selectedChar: Character | null = null
              if (shot) {
                if (shot.character && shot.character.shot_id === shotId) {
                  selectedChar = shot.character
                } else if (shot.characters) {
                  selectedChar = shot.characters.find((c: Character) => c.shot_id === shotId) || null
                }
              }
              
              if (selectedChar && (selectedChar as any).driving) {
                updateField("target", selectedChar)
                
                // Get the vehicle they're driving
                const drivingInfo = (selectedChar as any).driving
                const vehicle = vehicles.find(v => v.id === drivingInfo.id) || drivingInfo
                
                if (vehicle) {
                  // Update target vehicle-related fields
                  updateField("defense", VS.defense(vehicle))
                  updateField("handling", VS.isMook(vehicle) ? 0 : VS.handling(vehicle))
                  updateField("frame", VS.isMook(vehicle) ? 0 : VS.frame(vehicle))
                  updateField("targetVehicle", vehicle) // Store the vehicle reference
                }
              }
            }}
            borderColor="error.main"
            excludeShotId={attackerShotId}
          />
        </Box>
      </Stack>

      {/* Show message if no targets available */}
      {targetDriverShots.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No other characters driving vehicles available as targets.
        </Typography>
      )}

      {/* Target Vehicle Details */}
      {target && selectedVehicle && (
        <>
          {/* Vehicle Info Display */}
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {target.name} driving {selectedVehicle.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {VS.isPursuer(selectedVehicle) ? "Pursuer" : "Evader"} • Position: {VS.position(selectedVehicle)}
            </Typography>
            <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
              <Typography variant="body2">
                Defense: <strong>{formState.data.defense}</strong>
                {stunt && " (+2 Stunt)"}
              </Typography>
              <Typography variant="body2">
                Handling: <strong>{VS.handling(selectedVehicle)}</strong>
              </Typography>
              <Typography variant="body2">
                Frame: <strong>{VS.frame(selectedVehicle)}</strong>
              </Typography>
            </Stack>
            {VS.chasePoints(selectedVehicle) > 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                Chase Points: {VS.chasePoints(selectedVehicle)}/35
                {VS.chasePoints(selectedVehicle) >= 35 && " - VICTORY IMMINENT!"}
              </Typography>
            )}
            {VS.conditionPoints(selectedVehicle) > 0 && (
              <Typography variant="body2" color="error.main">
                Condition Points: {VS.conditionPoints(selectedVehicle)}
              </Typography>
            )}
          </Box>

          {/* Stunt Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={stunt || false}
                onChange={(e) => updateField("stunt", e.target.checked)}
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