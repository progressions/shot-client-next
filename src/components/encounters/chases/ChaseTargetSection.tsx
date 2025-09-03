"use client"

import { useState, useMemo } from "react"
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
import Avatar from "@/components/avatars/Avatar"
import { CharacterLink, VehicleLink } from "@/components/ui/links"

// Character with shot-specific data from encounter
interface CharacterWithShotData extends Character {
  driving_id?: string
  current_shot?: number | string | null
}

interface ChaseTargetSectionProps {
  shots: Shot[]  // All shots from encounter
  vehicles: Vehicle[]  // All vehicles from encounter
  formState: { data: ChaseFormData }
  dispatchForm: (action: { type: string; name?: string; value?: unknown }) => void
  target: Character | null  // Character who is driving
  attacker: Character | null  // Attacker character
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
  const [showAll, setShowAll] = useState(false)
  const targetShotId = (formState.data as ChaseFormData & { targetShotId?: string }).targetShotId
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
  // and filtering based on attacker's allegiance (unless showAll is true)
  const targetDriverShots = useMemo(() => {
    return shots.filter(shot => {
      // Exclude the attacker's shot
      if (shot.character && shot.character.shot_id === attackerShotId) {
        return false
      }
      if (shot.characters && shot.characters.some((c: Character) => c.shot_id === attackerShotId)) {
        return false
      }
      
      // If showAll is true, skip faction-based filtering
      if (!showAll) {
        // If attacker is friendly (PC/Ally), exclude other friendlies from targets
        if (attackerIsFriendly) {
          if (shot.character && CS.isType(shot.character, ["PC", "Ally"])) {
            return false
          }
          if (shot.characters) {
            // Filter out shots that only contain PCs/Allies
            const nonFriendlyDrivers = shot.characters.filter((c: Character) => 
              (c as CharacterWithShotData).driving_id && !CS.isType(c, ["PC", "Ally"])
            )
            if (nonFriendlyDrivers.length === 0) {
              return false
            }
          }
        } else {
          // If attacker is NOT friendly (enemy), only include PCs/Allies as targets
          if (shot.character && !CS.isType(shot.character, ["PC", "Ally"])) {
            return false
          }
          if (shot.characters) {
            // Filter out shots that don't contain any PCs/Allies
            const friendlyDrivers = shot.characters.filter((c: Character) => 
              (c as CharacterWithShotData).driving_id && CS.isType(c, ["PC", "Ally"])
            )
            if (friendlyDrivers.length === 0) {
              return false
            }
          }
        }
      }
      
      // Include only if character has driving_id
      if (shot.character) {
        return !!(shot.character as CharacterWithShotData).driving_id
      }
      if (shot.characters && shot.characters.length > 0) {
        return shot.characters.some((c: Character) => !!(c as CharacterWithShotData).driving_id)
      }
      return false
    })
  }, [shots, attackerShotId, attackerIsFriendly, showAll])


  // Get the vehicle being driven by the selected target
  const selectedVehicle = useMemo(() => {
    if (!target || !target.driving) return null
    const drivingInfo = target.driving
    
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
              
              if (selectedChar && selectedChar.driving) {
                updateField("target", selectedChar)
                
                // Get the vehicle they're driving
                const drivingInfo = selectedChar.driving
                const vehicle = vehicles.find(v => v.id === drivingInfo.id) || drivingInfo
                
                if (vehicle) {
                  
                  // Update target vehicle-related fields
                  const targetDriving = CS.skill(selectedChar, "Driving")
                  const targetHandling = VS.isMook(vehicle) ? 0 : VS.handling(vehicle)
                  const targetFrame = VS.isMook(vehicle) ? 0 : VS.frame(vehicle)
                  
                  updateField("defense", targetDriving) // Target's Driving is the difficulty
                  updateField("handling", targetHandling) // Target's Handling for chase point calculation
                  updateField("frame", targetFrame) // Target's Frame for damage calculation
                  updateField("targetVehicle", vehicle) // Store the vehicle reference
                }
              }
            }}
            borderColor="error.main"
            excludeShotId={attackerShotId}
          />
          
          {/* Show All Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                size="small"
              />
            }
            label="Show all characters"
            sx={{ 
              mt: 0.5,
              ml: 1,
              "& .MuiFormControlLabel-label": {
                fontSize: "0.75rem",
              }
            }}
          />
        </Box>
      </Stack>

      {/* Show message if no targets available */}
      {targetDriverShots.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          {attackerIsFriendly 
            ? "No enemy vehicles available as targets (friendly fire not allowed)."
            : "No player or ally vehicles available as targets."}
        </Typography>
      )}

      {/* Target Vehicle Details */}
      {target && selectedVehicle && (
        <>
          {/* Vehicle Info Display */}
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2 }}>
            <Stack direction="row" spacing={2}>
              <Avatar entity={selectedVehicle} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  <CharacterLink character={target}>
                    {target.name}
                  </CharacterLink>
                  {" driving "}
                  <VehicleLink vehicle={selectedVehicle}>
                    {selectedVehicle.name}
                  </VehicleLink>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  <strong>Defense</strong> {formState.data.defense} • <strong>Handling</strong> {formState.data.handling} • <strong>Frame</strong> {formState.data.frame}
                </Typography>
              </Box>
            </Stack>
            
            {/* Editable Defense Values */}
            <Stack 
              direction={{ xs: "column", sm: "row" }} 
              spacing={{ xs: 2, sm: 4 }}
              sx={{ mt: 2 }}
              alignItems="flex-start"
            >
              {/* Driving Value */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                  Driving
                </Typography>
                <NumberField
                  name="defense"
                  value={parseInt(formState.data.defense?.toString() || "0") || 0}
                  size="small"
                  width="80px"
                  error={false}
                  onChange={e => updateField("defense", e.target.value)}
                  onBlur={e => updateField("defense", e.target.value)}
                />
              </Box>
              
              {/* Handling Value */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                  Handling
                </Typography>
                <NumberField
                  name="handling"
                  value={parseInt(formState.data.handling?.toString() || "0") || 0}
                  size="small"
                  width="80px"
                  error={false}
                  onChange={e => updateField("handling", e.target.value)}
                  onBlur={e => updateField("handling", e.target.value)}
                />
              </Box>
              
              {/* Frame Value (editable) */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                  Frame
                </Typography>
                <NumberField
                  name="frame"
                  value={parseInt(formState.data.frame?.toString() || "0") || 0}
                  size="small"
                  width="80px"
                  error={false}
                  onChange={e => updateField("frame", e.target.value)}
                  onBlur={e => updateField("frame", e.target.value)}
                />
              </Box>
            </Stack>
            
            {VS.chasePoints(selectedVehicle) > 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
                Chase Points: {VS.chasePoints(selectedVehicle)}/35
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
                onChange={(e) => {
                  const isChecked = e.target.checked
                  updateField("stunt", isChecked)
                  
                  // Update defense value when stunt is toggled
                  const currentDefense = parseInt(formState.data.defense?.toString() || "0") || 0
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