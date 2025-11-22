"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Autocomplete,
  TextField as MuiTextField,
} from "@mui/material"
import { NumberField, TextField } from "@/components/ui"
import { useClient, useToast, useEncounter } from "@/contexts"
import { CS } from "@/services"
import { FormActions } from "@/reducers"
import type { Character, Vehicle } from "@/types"

interface CharacterEditDialogProps {
  open: boolean
  onClose: () => void
  character: Character
}

export default function CharacterEditDialog({
  open,
  onClose,
  character,
}: CharacterEditDialogProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { encounter, dispatchEncounter } = useEncounter()

  // Form state
  const [name, setName] = useState(character.name)
  const [currentShot, setCurrentShot] = useState<number | null>(0)
  const [wounds, setWounds] = useState<number>(0)
  const [impairments, setImpairments] = useState<number>(0)
  const [marksOfDeath, setMarksOfDeath] = useState<number>(0)
  const [fortune, setFortune] = useState<number>(0)
  const [drivingVehicleId, setDrivingVehicleId] = useState<string>("")
  const [statuses, setStatuses] = useState<string[]>(character.status || [])
  const [loading, setLoading] = useState(false)

  // Helper to check if character is PC
  const isPC = useCallback(() => CS.isPC(character), [character])
  const isMook = useCallback(() => CS.isMook(character), [character])

  // Collect all vehicles from the encounter (including hidden ones)
  const availableVehicles = useMemo(() => {
    if (!encounter?.shots) return []

    const vehicles: Vehicle[] = []
    const vehicleIds = new Set<string>()

    // Collect visible vehicles from shots
    encounter.shots.forEach(shot => {
      if (shot.vehicles && shot.vehicles.length > 0) {
        shot.vehicles.forEach((v: Vehicle) => {
          if (!vehicleIds.has(v.id)) {
            vehicles.push(v)
            vehicleIds.add(v.id)
          }
        })
      }
    })

    // Also check if any character is driving a vehicle that's not in the visible list
    // (vehicles with null shot are hidden but still driveable)
    encounter.shots.forEach(shot => {
      if (shot.characters && shot.characters.length > 0) {
        shot.characters.forEach(
          (c: Character & { driving?: Vehicle; driving_id?: string }) => {
            if (c.driving && c.driving.id && !vehicleIds.has(c.driving.id)) {
              vehicles.push(c.driving)
              vehicleIds.add(c.driving.id)
            }
          }
        )
      }
    })

    // Finally, make sure the current character's vehicle is included
    const characterWithDriving = character as Character & {
      driving?: Vehicle
      driving_id?: string
    }
    if (
      characterWithDriving.driving &&
      characterWithDriving.driving.id &&
      !vehicleIds.has(characterWithDriving.driving.id)
    ) {
      vehicles.push(characterWithDriving.driving)
      vehicleIds.add(characterWithDriving.driving.id)
    }

    return vehicles
  }, [encounter?.shots, character])

  // Initialize form values when dialog opens
  useEffect(() => {
    if (open && !loading) {
      setName(character.name || "")
      // Get current shot from character's shot_id data
      // For now, using the current_shot field if available
      const characterWithShot = character as Character & {
        current_shot?: number | string | null
      }
      const shot = characterWithShot.current_shot

      // Handle null (hidden), 0 (shot 0), or other numbers
      if (shot === null || shot === undefined || shot === "") {
        setCurrentShot(null)
      } else {
        setCurrentShot(
          typeof shot === "number" ? shot : parseInt(String(shot)) || 0
        )
      }

      // Get wounds using CharacterService
      setWounds(CS.wounds(character) || 0)

      // Get marks of death from action_values
      setMarksOfDeath(character.action_values?.["Marks of Death"] || 0)

      // Get fortune from action_values (for PCs)
      setFortune(CS.fortune(character) || 0)

      // Get impairments based on character type
      if (isPC()) {
        // For PCs, impairments are on the character model
        setImpairments(character.impairments || 0)
      } else {
        // For non-PCs, impairments would be on the shot association
        // We'll need to get this from the shot data
        const characterWithShotImpairments = character as Character & {
          shot_impairments?: number
        }
        setImpairments(
          characterWithShotImpairments.shot_impairments ||
            character.impairments ||
            0
        )
      }

      // Set driving vehicle if character has driving_id or driving property
      const characterWithDriving = character as Character & {
        driving?: Vehicle
        driving_id?: string
      }

      // Find the matching vehicle ID from availableVehicles
      let vehicleIdToSet = ""

      // The driving_id is actually the shot_id, not the vehicle id
      // We need to find the vehicle by matching shot_id
      if (characterWithDriving.driving_id) {
        // Find vehicle with matching shot_id
        const matchingVehicle = availableVehicles.find(
          v => v.shot_id === characterWithDriving.driving_id
        )
        if (matchingVehicle) {
          vehicleIdToSet = matchingVehicle.id
        }
      } else if (
        characterWithDriving.driving &&
        characterWithDriving.driving.id
      ) {
        // Check if character has a driving property with vehicle info
        vehicleIdToSet = characterWithDriving.driving.id
      }

      // Set statuses
      setStatuses(character.status || [])

      // Debug logging
      console.log("Character driving info:", {
        driving_id: characterWithDriving.driving_id,
        driving: characterWithDriving.driving,
        vehicleIdToSet,
        availableVehicles: availableVehicles.map(v => ({
          id: v.id,
          shot_id: v.shot_id,
          name: v.name,
        })),
      })

      setDrivingVehicleId(vehicleIdToSet)
    }
  }, [open, character, availableVehicles, isPC])

  // Validation
  const isValid = () => {
    return (
      name.trim().length > 0 &&
      wounds >= 0 &&
      impairments >= 0 &&
      marksOfDeath >= 0 &&
      fortune >= 0
    )
  }

  // Handle save
  const handleSave = async () => {
    if (!isValid()) {
      toastError("Please check your input values")
      return
    }

    setLoading(true)
    try {
      // Prepare character update payload
      interface CharacterUpdate {
        name: string
        action_values?: Record<string, unknown>
        impairments?: number
        status?: string[]
      }

      const characterUpdate: CharacterUpdate = {
        name: name.trim(),
        status: statuses,
      }

      // Handle wounds, marks of death, and fortune based on character type
      if (isPC()) {
        // PCs: wounds, marks of death, fortune, and impairments are always on the character model
        characterUpdate.action_values = {
          ...character.action_values,
          Wounds: wounds,
          "Marks of Death": marksOfDeath,
          Fortune: fortune,
        }
        characterUpdate.impairments = impairments
      } else if (isMook()) {
        // Mooks: no marks of death or impairments
        characterUpdate.action_values = {
          ...character.action_values,
        }
      } else {
        // Other NPCs: no marks of death on character
        // Count and impairments are ONLY relevant in fights (stored on Shot)
        characterUpdate.action_values = {
          ...character.action_values,
        }
      }

      // Update character (without driving_id - that goes on the shot)
      console.log("Updating character with:", characterUpdate)
      await client.updateCharacterCombatStats(character.id, characterUpdate)

      // Handle vehicle driver updates
      if (drivingVehicleId) {
        // Find the vehicle and update its driver_id
        const vehicle = availableVehicles.find(v => v.id === drivingVehicleId)
        console.log("Found vehicle to update:", vehicle)
        if (vehicle) {
          // Update vehicle's driver_id - need to use FormData
          const vehicleFormData = new FormData()
          vehicleFormData.append("vehicle[driver_id]", character.id)
          console.log(
            "Updating vehicle",
            vehicle.id,
            "with driver_id:",
            character.id
          )
          await client.updateVehicle(vehicle.id, vehicleFormData)

          // If vehicle had a previous driver, clear their driving_id
          if (vehicle.driver_id && vehicle.driver_id !== character.id) {
            // Find the previous driver and clear their driving_id
            for (const shot of encounter.shots) {
              if (shot.characters) {
                const previousDriver = shot.characters.find(
                  (c: Character) => c.id === vehicle.driver_id
                )
                if (previousDriver) {
                  await client.updateCharacterCombatStats(previousDriver.id, {
                    driving_id: null,
                  })
                  break
                }
              }
            }
          }
        }
      } else {
        // Clear any vehicle that this character was previously driving
        const characterWithDriving = character as Character & {
          driving_id?: string
        }
        if (characterWithDriving.driving_id) {
          // Find vehicle by shot_id since driving_id is actually the shot_id
          const previousVehicle = availableVehicles.find(
            v => v.shot_id === characterWithDriving.driving_id
          )
          if (previousVehicle) {
            const vehicleFormData = new FormData()
            vehicleFormData.append("vehicle[driver_id]", "")
            await client.updateVehicle(previousVehicle.id, vehicleFormData)
          }
        }
      }

      // Update shot if we have shot data
      if (character.shot_id && encounter) {
        interface ShotUpdate {
          shot_id: string
          current_shot: number | null
          impairments?: number
          count?: number
          driving_id?: string | null
        }

        const shotUpdate: ShotUpdate = {
          shot_id: character.shot_id,
          current_shot: currentShot,
        }

        // For non-PCs (except Mooks), impairments and count go on the shot
        // For PCs, only current_shot goes on the shot (impairments are on character)
        // For Mooks, only count goes on the shot (no impairments)
        if (!isPC()) {
          if (isMook()) {
            shotUpdate.count = wounds // Count for mooks
          } else {
            shotUpdate.impairments = impairments
            shotUpdate.count = wounds
          }
        }

        // Add driving_id to shot update (use vehicle's shot_id, not vehicle id)
        if (drivingVehicleId) {
          // Find the vehicle to get its shot_id
          const vehicle = availableVehicles.find(v => v.id === drivingVehicleId)
          shotUpdate.driving_id = vehicle?.shot_id || null
        } else {
          shotUpdate.driving_id = null
        }

        // Update shot
        await client.updateCharacterShot(encounter, character, shotUpdate)

        // Also update the vehicle's shot with driver_id if assigning a vehicle
        if (drivingVehicleId) {
          const vehicle = availableVehicles.find(v => v.id === drivingVehicleId)
          if (vehicle && vehicle.shot_id) {
            await client.updateVehicleShot(encounter, vehicle, {
              shot_id: vehicle.shot_id,
              driver_id: character.shot_id,
            })
          }
        } else {
          // Clear driver_id from any previously driven vehicle
          const characterWithDriving = character as Character & {
            driving_id?: string
          }
          if (characterWithDriving.driving_id) {
            // driving_id IS the vehicle's shot_id
            const previousVehicle = availableVehicles.find(
              v => v.shot_id === characterWithDriving.driving_id
            )
            if (previousVehicle && previousVehicle.shot_id) {
              await client.updateVehicleShot(encounter, previousVehicle, {
                shot_id: previousVehicle.shot_id,
                driver_id: null,
              })
            }
          }
        }
      }

      // Fetch the updated encounter to refresh the display
      const updatedEncounterResponse = await client.getEncounter(encounter)

      toastSuccess(`Updated ${name}`)
      onClose()

      // Update local encounter state with fresh data (without making another API call)
      if (updatedEncounterResponse.data) {
        setTimeout(() => {
          dispatchEncounter({
            type: FormActions.UPDATE,
            name: "encounter",
            value: updatedEncounterResponse.data,
          })
        }, 100)
      }
    } catch (error) {
      console.error("Error updating character:", error)
      toastError(`Failed to update ${character.name}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit {character.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 2 }}>
          {/* Name field */}
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            size="small"
            error={name.trim().length === 0}
            helperText={name.trim().length === 0 ? "Name is required" : ""}
          />

          {/* Combat Stats Row */}
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={isMook() ? 6 : isPC() ? 2.4 : 4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Current Shot
                </Typography>
                <NumberField
                  value={currentShot}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement> | number
                  ) => {
                    const val =
                      typeof e === "object" && "target" in e
                        ? e.target.value
                        : e
                    if (val === "" || val === null) {
                      setCurrentShot(null)
                    } else {
                      setCurrentShot(
                        typeof val === "number"
                          ? val
                          : parseInt(String(val)) || 0
                      )
                    }
                  }}
                  onBlur={() => {}}
                  disabled={loading}
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={isMook() ? 6 : isPC() ? 2.4 : 4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  {CS.isMook(character) ? "Count" : "Wounds"}
                </Typography>
                <NumberField
                  value={wounds}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement> | number
                  ) => {
                    const val =
                      typeof e === "object" && "target" in e
                        ? e.target.value
                        : e
                    setWounds(
                      typeof val === "number" ? val : parseInt(String(val)) || 0
                    )
                  }}
                  onBlur={() => {}}
                  min={0}
                  disabled={loading}
                  size="small"
                  fullWidth
                />
              </Grid>

              {!isMook() && (
                <Grid item xs={isPC() ? 2.4 : 4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    Impairments
                  </Typography>
                  <NumberField
                    value={impairments}
                    onChange={(
                      e: React.ChangeEvent<HTMLInputElement> | number
                    ) => {
                      const val =
                        typeof e === "object" && "target" in e
                          ? e.target.value
                          : e
                      setImpairments(
                        typeof val === "number"
                          ? val
                          : parseInt(String(val)) || 0
                      )
                    }}
                    onBlur={() => {}}
                    min={0}
                    disabled={loading}
                    size="small"
                    fullWidth
                  />
                </Grid>
              )}

              {isPC() && (
                <>
                  <Grid item xs={2.4}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Marks of Death
                    </Typography>
                    <NumberField
                      value={marksOfDeath}
                      onChange={(
                        e: React.ChangeEvent<HTMLInputElement> | number
                      ) => {
                        const val =
                          typeof e === "object" && "target" in e
                            ? e.target.value
                            : e
                        setMarksOfDeath(
                          typeof val === "number"
                            ? val
                            : parseInt(String(val)) || 0
                        )
                      }}
                      onBlur={() => {}}
                      min={0}
                      disabled={loading}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2.4}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Fortune
                    </Typography>
                    <NumberField
                      value={fortune}
                      onChange={(
                        e: React.ChangeEvent<HTMLInputElement> | number
                      ) => {
                        const val =
                          typeof e === "object" && "target" in e
                            ? e.target.value
                            : e
                        setFortune(
                          typeof val === "number"
                            ? val
                            : parseInt(String(val)) || 0
                        )
                      }}
                      onBlur={() => {}}
                      min={0}
                      disabled={loading}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          {/* Driving dropdown */}
          <FormControl fullWidth size="small">
            <InputLabel id="driving-select-label">Driving</InputLabel>
            <Select
              labelId="driving-select-label"
              value={drivingVehicleId}
              onChange={e => setDrivingVehicleId(e.target.value as string)}
              label="Driving"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                },
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {availableVehicles.map((vehicle: Vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <span>{vehicle.name}</span>
                    {vehicle.driver && vehicle.driver.id !== character.id && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ ml: 1, color: "text.secondary" }}
                      >
                        (currently driven by{" "}
                        {vehicle.driver.name || vehicle.driver})
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status field */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              Status
            </Typography>
            <Autocomplete
              multiple
              freeSolo
              value={statuses}
              onChange={(_, newValue) => setStatuses(newValue)}
              options={[
                "up_check_required",
                "out_of_fight",
                "stunned",
                "hidden",
              ]}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index })
                  return (
                    <Chip
                      key={key}
                      variant="outlined"
                      label={option.replace(/_/g, " ").toUpperCase()}
                      {...tagProps}
                      size="small"
                      color={
                        option === "out_of_fight"
                          ? "error"
                          : option === "up_check_required"
                            ? "warning"
                            : "default"
                      }
                    />
                  )
                })
              }
              renderInput={params => (
                <MuiTextField
                  {...params}
                  variant="outlined"
                  placeholder="Add status..."
                  size="small"
                  helperText="Click to add status, or type custom status and press Enter"
                />
              )}
              disabled={loading}
              sx={{
                "& .MuiAutocomplete-tag": {
                  margin: "2px",
                },
              }}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !isValid()}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
