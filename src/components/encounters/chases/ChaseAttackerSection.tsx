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
import Avatar from "@/components/avatars/Avatar"
import { CharacterLink, VehicleLink } from "@/components/ui/links"

interface ChaseAttackerSectionProps {
  shots: Shot[] // All shots from encounter
  vehicles: Vehicle[] // All vehicles from encounter
  formState: { data: ChaseFormData }
  dispatchForm: (action: { type: string; name?: string; value?: unknown }) => void
  attacker: Character | null // Character who is driving
  target: Character | null // Target character who is driving
}

export default function ChaseAttackerSection({
  shots,
  vehicles,
  formState,
  dispatchForm,
  attacker,
  target,
}: ChaseAttackerSectionProps) {
  const { attackerShotId, shotCost } = formState.data as { attackerShotId?: string; shotCost?: number }

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
        return !!(shot.character as Character & { driving_id?: string }).driving_id
      }
      if (shot.characters && shot.characters.length > 0) {
        // Keep shot if any character has driving_id
        return shot.characters.some((c: Character) => !!(c as Character & { driving_id?: string }).driving_id)
      }
      return false
    })
  }, [shots])

  // Get the vehicle being driven by the selected character
  const selectedVehicle = useMemo(() => {
    if (!attacker || !(attacker as Character & { driving?: Vehicle }).driving) return null
    const drivingInfo = (attacker as Character & { driving?: Vehicle }).driving

    // Find the full vehicle data from vehicles array
    const fullVehicle = vehicles.find(v => v.id === drivingInfo.id)
    return fullVehicle || drivingInfo
  }, [attacker, vehicles])

  // Get chase options based on the selected character's skills
  const chaseOptions = useMemo(() => {
    if (!attacker) return []

    // Character uses their Driving skill
    const drivingSkill = CS.skill(attacker, "Driving")

    return [{ skill: "Driving", value: drivingSkill }]
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
            onSelect={shotId => {
              updateField("attackerShotId", shotId)

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

              if (selectedChar && (selectedChar as Character & { driving?: Vehicle }).driving) {
                updateField("attacker", selectedChar)

                // Get the vehicle they're driving
                const drivingInfo = (selectedChar as Character & { driving?: Vehicle }).driving
                const vehicle =
                  vehicles.find(v => v.id === drivingInfo.id) || drivingInfo

                if (vehicle) {
                  // Update vehicle-related fields
                  const drivingValue = CS.skill(selectedChar, "Driving")
                  const isPursuer = VS.isPursuer(vehicle)

                  updateField("actionValue", drivingValue)
                  updateField("handling", VS.handling(vehicle))
                  updateField("squeal", VS.squeal(vehicle))
                  updateField("frame", VS.frame(vehicle))
                  updateField("crunch", VS.crunch(vehicle))
                  // Don't set position here - it comes from ChaseRelationship or defaults
                  updateField("impairments", VS.impairments(vehicle))
                  updateField("vehicle", vehicle) // Store the vehicle reference

                  // Set default method based on pursuer/evader and current position
                  // Don't set method here - it will be set when the chase relationship is loaded
                  // or when the user manually changes role/position
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
          No characters are currently driving vehicles. Assign a vehicle to a
          character to enable chase actions.
        </Typography>
      )}

      {/* Chase Skill and Vehicle Stats - Only show role/action/position when target is selected */}
      {attacker && selectedVehicle && (
        <>
          {/* Role, Chase Action, and Position Selection - Only show when target is selected */}
          {(formState.data as ChaseFormData & { targetShotId?: string })
            .targetShotId &&
            formState.data.target && (
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                {/* Role Selection */}
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formState.data.attackerRole || "pursuer"}
                    onChange={e => {
                      const newRole = e.target.value as "pursuer" | "evader"
                      updateField("attackerRole", newRole)

                      // Update default method based on new role and current position
                      const position = formState.data.position
                      let defaultMethod = "EVADE"
                      if (newRole === "pursuer") {
                        defaultMethod =
                          position === "near"
                            ? "RAM_SIDESWIPE"
                            : "NARROW_THE_GAP"
                      } else {
                        defaultMethod =
                          position === "near" ? "WIDEN_THE_GAP" : "EVADE"
                      }
                      updateField("method", defaultMethod)
                    }}
                    label="Role"
                  >
                    <MenuItem value="pursuer">Pursuer</MenuItem>
                    <MenuItem value="evader">Evader</MenuItem>
                  </Select>
                </FormControl>

                {/* Chase Action Selection */}
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Chase Action</InputLabel>
                  <Select
                    value={(() => {
                      // Validate that current method is valid for role/position
                      const role = formState.data.attackerRole || "pursuer"
                      const position = formState.data.position
                      const method = formState.data.method

                      if (role === "pursuer") {
                        if (position === "near") {
                          // Valid methods: RAM_SIDESWIPE, EVADE
                          return ["RAM_SIDESWIPE", "EVADE"].includes(method)
                            ? method
                            : "RAM_SIDESWIPE"
                        } else {
                          // Valid method: NARROW_THE_GAP
                          return "NARROW_THE_GAP"
                        }
                      } else {
                        if (position === "near") {
                          // Valid methods: WIDEN_THE_GAP, RAM_SIDESWIPE
                          return ["WIDEN_THE_GAP", "RAM_SIDESWIPE"].includes(
                            method
                          )
                            ? method
                            : "WIDEN_THE_GAP"
                        } else {
                          // Valid method: EVADE
                          return "EVADE"
                        }
                      }
                    })()}
                    onChange={e => updateField("method", e.target.value)}
                    label="Chase Action"
                  >
                    {(formState.data.attackerRole || "pursuer") === "pursuer"
                      ? // Pursuer options
                        formState.data.position === "near"
                        ? [
                            // When NEAR, pursuer can ram/sideswipe or evade
                            <MenuItem key="RAM_SIDESWIPE" value="RAM_SIDESWIPE">
                              Ram/Sideswipe
                            </MenuItem>,
                            <MenuItem key="EVADE" value="EVADE">
                              Evade
                            </MenuItem>,
                          ]
                        : [
                            // When FAR, pursuer can only narrow the gap
                            <MenuItem
                              key="NARROW_THE_GAP"
                              value="NARROW_THE_GAP"
                            >
                              Narrow the Gap
                            </MenuItem>,
                          ]
                      : // Evader options
                        formState.data.position === "near"
                        ? [
                            // When NEAR, evader can widen the gap or ram/sideswipe
                            <MenuItem key="WIDEN_THE_GAP" value="WIDEN_THE_GAP">
                              Widen the Gap
                            </MenuItem>,
                            <MenuItem key="RAM_SIDESWIPE" value="RAM_SIDESWIPE">
                              Ram/Sideswipe
                            </MenuItem>,
                          ]
                        : [
                            // When FAR, evader tries to maintain distance
                            <MenuItem key="EVADE" value="EVADE">
                              Evade
                            </MenuItem>,
                          ]}
                  </Select>
                </FormControl>

                {/* Position Selection */}
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Position</InputLabel>
                  <Select
                    value={(() => {
                      console.log(
                        "Position dropdown value:",
                        formState.data.position
                      )
                      return formState.data.position || "far"
                    })()}
                    onChange={e => {
                      const newPosition = e.target.value as "near" | "far"
                      updateField("position", newPosition)

                      // Update method based on role and new position
                      const role = formState.data.attackerRole || "pursuer"
                      let defaultMethod = "EVADE"
                      if (role === "pursuer") {
                        defaultMethod =
                          newPosition === "near"
                            ? "RAM_SIDESWIPE"
                            : "NARROW_THE_GAP"
                      } else {
                        defaultMethod =
                          newPosition === "near" ? "WIDEN_THE_GAP" : "EVADE"
                      }
                      updateField("method", defaultMethod)
                    }}
                    label="Position"
                  >
                    <MenuItem value="near">Near</MenuItem>
                    <MenuItem value="far">Far</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}

          {/* Chase Values and Vehicle Info */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 2, sm: 2 }}
            sx={{ mb: 3 }}
          >
            {/* Left side: Chase Value and Squeal */}
            <Stack direction="row" spacing={2}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: "medium" }}
                >
                  Chase Value
                </Typography>
                <NumberField
                  name="actionValue"
                  value={
                    parseInt(formState.data.actionValue?.toString() || "0") || 0
                  }
                  size="small"
                  width="90px"
                  error={false}
                  onChange={e => updateField("actionValue", e.target.value)}
                  onBlur={e => updateField("actionValue", e.target.value)}
                />
                {formState.data.impairments > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      color: "error.main",
                      fontSize: "0.7rem",
                    }}
                  >
                    -{formState.data.impairments} impairments
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, fontWeight: "medium" }}
                >
                  Squeal
                </Typography>
                <NumberField
                  name="squeal"
                  value={
                    parseInt(formState.data.squeal?.toString() || "0") || 0
                  }
                  size="small"
                  width="90px"
                  error={false}
                  onChange={e => updateField("squeal", e.target.value)}
                  onBlur={e => updateField("squeal", e.target.value)}
                />
              </Box>
            </Stack>

            {/* Right side: Vehicle Status Display */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 1,
              }}
            >
              <Stack direction="row" spacing={2}>
                <Avatar
                  entity={selectedVehicle}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    <CharacterLink character={attacker}>
                      {attacker.name}
                    </CharacterLink>
                    {" driving "}
                    <VehicleLink vehicle={selectedVehicle}>
                      {selectedVehicle.name}
                    </VehicleLink>
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block" }}
                  >
                    <strong>Acceleration</strong>{" "}
                    {VS.acceleration(selectedVehicle)} •{" "}
                    <strong>Handling</strong> {VS.handling(selectedVehicle)} •{" "}
                    <strong>Squeal</strong> {VS.squeal(selectedVehicle)} •{" "}
                    <strong>Frame</strong> {VS.frame(selectedVehicle)} •{" "}
                    <strong>Crunch</strong> {VS.crunch(selectedVehicle)}
                  </Typography>
                </Box>
              </Stack>
              {(VS.chasePoints(selectedVehicle) > 0 ||
                VS.conditionPoints(selectedVehicle) > 0) && (
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  {VS.chasePoints(selectedVehicle) > 0 && (
                    <Typography variant="caption" color="warning.main">
                      Chase Points: {VS.chasePoints(selectedVehicle)}/35
                    </Typography>
                  )}
                  {VS.conditionPoints(selectedVehicle) > 0 && (
                    <Typography variant="caption" color="error.main">
                      Condition Points: {VS.conditionPoints(selectedVehicle)}
                    </Typography>
                  )}
                </Stack>
              )}
            </Box>
          </Stack>
        </>
      )}
    </Box>
  )
}
