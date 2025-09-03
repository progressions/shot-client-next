"use client"

import { useMemo } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Stack,
} from "@mui/material"
import { VS, CS } from "@/services"
import type { ChaseFormData, Shot, Vehicle, Character } from "@/types"
import { FormActions } from "@/reducers"
import { NumberField } from "@/components/ui"
import CharacterSelector from "../CharacterSelector"

interface ChaseAttackerSectionProps {
  shots: Shot[]  // All shots from encounter
  vehicles: Vehicle[]  // All vehicles from encounter
  formState: { data: ChaseFormData }
  dispatchForm: (action: any) => void
  attacker: Character | null  // Character who is driving
}

export default function ChaseAttackerSection({
  shots,
  vehicles,
  formState,
  dispatchForm,
  attacker,
}: ChaseAttackerSectionProps) {
  const { attackerShotId, shotCost } = formState.data as any

  // Helper to update a field
  const updateField = (name: string, value: unknown) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name,
      value,
    })
  }

  // Filter shots to only include characters with driving_id
  const driverShots = useMemo(() => {
    return shots.filter(shot => {
      if (shot.character) {
        return !!(shot.character as any).driving_id
      }
      if (shot.characters && shot.characters.length > 0) {
        // Keep shot if any character has driving_id
        return shot.characters.some((c: Character) => !!(c as any).driving_id)
      }
      return false
    })
  }, [shots])


  // Get the vehicle being driven by the selected character
  const selectedVehicle = useMemo(() => {
    if (!attacker || !(attacker as any).driving) return null
    const drivingInfo = (attacker as any).driving
    
    // Find the full vehicle data from vehicles array
    const fullVehicle = vehicles.find(v => v.id === drivingInfo.id)
    return fullVehicle || drivingInfo
  }, [attacker, vehicles])

  // Get chase options based on the selected character's skills
  const chaseOptions = useMemo(() => {
    if (!attacker) return []
    
    // Character uses their Driving skill
    const drivingSkill = CS.skill(attacker, "Driving")
    
    return [
      { skill: "Driving", value: drivingSkill }
    ]
  }, [attacker])

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderBottom: "2px solid",
        borderBottomColor: "divider",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
        🏎️ Attacker
      </Typography>

      {/* Avatar Selection and Shot Cost on same line */}
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CharacterSelector
            shots={driverShots}
            selectedShotId={attackerShotId}
            onSelect={(shotId) => {
              console.log("Selected shot ID:", shotId)
              updateField("attackerShotId", shotId)
              
              // Find the character that was selected
              const shot = shots.find(s => 
                (s.character && s.character.shot_id === shotId) ||
                (s.characters && s.characters.some((c: Character) => c.shot_id === shotId))
              )
              console.log("Found shot:", shot)
              
              let selectedChar: Character | null = null
              if (shot) {
                if (shot.character && shot.character.shot_id === shotId) {
                  selectedChar = shot.character
                } else if (shot.characters) {
                  selectedChar = shot.characters.find((c: Character) => c.shot_id === shotId) || null
                }
              }
              
              if (selectedChar && (selectedChar as any).driving) {
                updateField("attacker", selectedChar)
                
                // Get the vehicle they're driving
                const drivingInfo = (selectedChar as any).driving
                const vehicle = vehicles.find(v => v.id === drivingInfo.id) || drivingInfo
                
                if (vehicle) {
                  // Update vehicle-related fields
                  const drivingValue = CS.skill(selectedChar, "Driving")
                  updateField("actionValue", drivingValue)
                  updateField("handling", VS.handling(vehicle))
                  updateField("squeal", VS.squeal(vehicle))
                  updateField("frame", VS.frame(vehicle))
                  updateField("crunch", VS.crunch(vehicle))
                  updateField("position", VS.position(vehicle))
                  updateField("impairments", VS.impairments(vehicle))
                  updateField("vehicle", vehicle) // Store the vehicle reference
                }
              }
            }}
            borderColor="primary.main"
          />
        </Box>

        {/* Shot Cost */}
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
            Shot Cost
          </Typography>
          <NumberField
            name="shotCost"
            value={parseInt(shotCost || "3") || 3}
            size="small"
            width="80px"
            error={false}
            onChange={e => updateField("shotCost", e.target.value)}
            onBlur={e => updateField("shotCost", e.target.value)}
          />
        </Box>
      </Stack>

      {/* Show message if no drivers available */}
      {driverShots.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No characters are currently driving vehicles. Assign a vehicle to a character to enable chase actions.
        </Typography>
      )}

      {/* Chase Skill and Vehicle Stats */}
      {attacker && selectedVehicle && (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 2 }}
            sx={{ mb: 3 }}
          >
            {/* Driving Skill Block */}
            <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: "medium" }}>
                Chase Value
              </Typography>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box>
                  <NumberField
                    name="actionValue"
                    value={parseInt(formState.data.actionValue?.toString() || "0") || 0}
                    size="small"
                    width="80px"
                    error={false}
                    onChange={e => updateField("actionValue", e.target.value)}
                    onBlur={e => updateField("actionValue", e.target.value)}
                  />
                  {formState.data.impairments > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.25,
                        color: "error.main",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      -{formState.data.impairments}
                    </Typography>
                  )}
                </Box>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: { xs: 120, sm: 150 },
                    "& .MuiInputBase-root": { height: 56 },
                  }}
                >
                  <InputLabel>Chase Method</InputLabel>
                  <Select
                    value="Driving"
                    onChange={e => {
                      const option = chaseOptions.find(o => o.skill === e.target.value)
                      if (option) {
                        updateField("actionValue", option.value.toString())
                      }
                    }}
                    label="Chase Method"
                  >
                    {chaseOptions.map(option => (
                      <MenuItem key={option.skill} value={option.skill}>
                        {option.skill} ({option.value})
                      </MenuItem>
                    ))}
                  </Select>
                  {formState.data.impairments > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 0.5,
                        ml: 1.75,
                        color: "text.secondary",
                        fontStyle: "italic",
                      }}
                    >
                      -{formState.data.impairments} from condition points
                    </Typography>
                  )}
                </FormControl>
              </Stack>
            </Box>

            {/* Squeal Block */}
            <Box sx={{ width: { xs: "100%", sm: "50%" } }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: "medium" }}>
                Squeal
              </Typography>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Box>
                  <NumberField
                    name="squeal"
                    value={parseInt(formState.data.squeal?.toString() || "0") || 0}
                    size="small"
                    width="80px"
                    error={false}
                    onChange={e => updateField("squeal", e.target.value)}
                    onBlur={e => updateField("squeal", e.target.value)}
                  />
                </Box>
                <FormControl
                  sx={{
                    flex: 1,
                    minWidth: { xs: 120, sm: 150 },
                    "& .MuiInputBase-root": { height: 56 },
                  }}
                >
                  <InputLabel>Vehicle</InputLabel>
                  <Select
                    value={selectedVehicle.id || ""}
                    label="Vehicle"
                    disabled
                  >
                    <MenuItem value={selectedVehicle.id || ""}>
                      {selectedVehicle.name} (Squeal: {VS.squeal(selectedVehicle)})
                    </MenuItem>
                  </Select>
                  <Typography
                    variant="caption"
                    sx={{
                        display: "block",
                      mt: 0.5,
                      ml: 1.75,
                      color: "text.secondary",
                      fontStyle: "italic",
                    }}
                  >
                    Handling: {VS.handling(selectedVehicle)}, Crunch: {VS.crunch(selectedVehicle)}
                  </Typography>
                </FormControl>
              </Stack>
            </Box>
          </Stack>

          {/* Vehicle Status Display */}
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {attacker.name} driving {selectedVehicle.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {VS.isPursuer(selectedVehicle) ? "Pursuer" : "Evader"} • Position: {VS.position(selectedVehicle)}
            </Typography>
            {VS.chasePoints(selectedVehicle) > 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                Chase Points: {VS.chasePoints(selectedVehicle)}/35
              </Typography>
            )}
            {VS.conditionPoints(selectedVehicle) > 0 && (
              <Typography variant="body2" color="error.main">
                Condition Points: {VS.conditionPoints(selectedVehicle)}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  )
}