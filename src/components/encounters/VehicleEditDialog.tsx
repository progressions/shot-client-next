"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material"
import { NumberField } from "@/components/ui"
import { useClient, useToast, useEncounter } from "@/contexts"
import type { Vehicle, Character } from "@/types"

interface VehicleEditDialogProps {
  open: boolean
  onClose: () => void
  vehicle: Vehicle
}

export default function VehicleEditDialog({
  open,
  onClose,
  vehicle,
}: VehicleEditDialogProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { encounter } = useEncounter()

  // Form state
  const [name, setName] = useState(vehicle.name)
  // Current shot removed - no longer relevant for vehicles
  const [chasePoints, setChasePoints] = useState<number>(0)
  const [conditionPoints, setConditionPoints] = useState<number>(0)
  const [impairments, setImpairments] = useState<number>(0)
  const [driverId, setDriverId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // Get available characters from the encounter
  const availableCharacters = useMemo(() => {
    console.log("VehicleEditDialog - encounter object:", encounter)
    if (!encounter?.shots) return []

    // Get all characters from shots that are not hidden (shot.shot is not null)
    const characters = encounter.shots
      .filter(shot => shot.shot !== null)
      .flatMap(shot => shot.characters || [])
      .filter((char): char is Character => char !== undefined)

    console.log("Available characters:", characters)
    return characters
  }, [encounter])

  // Initialize form values when dialog opens
  useEffect(() => {
    if (open) {
      console.log("VehicleEditDialog - Vehicle data:", vehicle)
      console.log("VehicleEditDialog - Vehicle driver:", vehicle.driver)

      setName(vehicle.name || "")

      // Current shot initialization removed - no longer relevant

      // Get chase points from action_values
      setChasePoints(vehicle.action_values?.["Chase Points"] || 0)

      // Get condition points from action_values
      setConditionPoints(vehicle.action_values?.["Condition Points"] || 0)

      // Get impairments from shot data
      const vehicleWithShotImpairments = vehicle as Vehicle & {
        shot_impairments?: number
      }
      setImpairments(
        vehicleWithShotImpairments.shot_impairments || vehicle.impairments || 0
      )

      // Set driver if vehicle has one - driver_id is a shot_id
      if (vehicle.driver_id) {
        console.log("Setting driver_id (shot_id):", vehicle.driver_id)
        setDriverId(vehicle.driver_id)
      } else {
        console.log("No driver_id found on vehicle")
        setDriverId("")
      }
    }
  }, [open, vehicle, availableCharacters])

  // Validation
  const isValid = () => {
    return (
      name.trim().length > 0 &&
      chasePoints >= 0 &&
      conditionPoints >= 0 &&
      impairments >= 0
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
      // Prepare vehicle update payload
      interface VehicleUpdate {
        name: string
        action_values: Record<string, unknown>
      }

      const vehicleUpdate: VehicleUpdate = {
        name: name.trim(),
        action_values: {
          ...vehicle.action_values,
          "Chase Points": chasePoints,
          "Condition Points": conditionPoints,
        },
      }

      // Update vehicle
      await client.updateVehicleCombatStats(vehicle.id, vehicleUpdate)

      // Update shot if we have shot data
      if (vehicle.shot_id) {
        interface ShotUpdate {
          shot_id: string
          current_shot: number | null
          impairments?: number
          driver_id?: string
        }

        const shotUpdate: ShotUpdate = {
          shot_id: vehicle.shot_id,
          current_shot: null, // Vehicles don't use current_shot
        }

        // Add impairments for vehicles (stored on shot)
        shotUpdate.impairments = impairments

        // Add driver_id if set (empty string means no driver)
        shotUpdate.driver_id = driverId

        // Update shot
        await client.updateVehicleShot(encounter, vehicle, shotUpdate)
      }

      toastSuccess(`Updated ${name}`)
      onClose()
    } catch (error) {
      console.error("Error updating vehicle:", error)
      toastError(`Failed to update ${vehicle.name}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit {vehicle.name}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 2 }}>
          {/* Name field */}
          <TextField
            fullWidth
            label="Vehicle Name"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            size="small"
            error={name.trim().length === 0}
            helperText={name.trim().length === 0 ? "Name is required" : ""}
          />

          {/* Driver selection */}
          <FormControl fullWidth size="small">
            <InputLabel id="driver-select-label">Driver</InputLabel>
            <Select
              labelId="driver-select-label"
              id="driver-select"
              value={driverId}
              label="Driver"
              onChange={e => setDriverId(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>No driver</em>
              </MenuItem>
              {availableCharacters.map((character: Character) => (
                <MenuItem key={character.shot_id} value={character.shot_id}>
                  {character.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Select a character to drive this vehicle
            </FormHelperText>
          </FormControl>

          {/* Combat Stats Row */}
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Chase Points
                </Typography>
                <NumberField
                  value={chasePoints}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement> | number
                  ) => {
                    const val =
                      typeof e === "object" && "target" in e
                        ? e.target.value
                        : e
                    setChasePoints(
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

              <Grid item xs={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Condition Points
                </Typography>
                <NumberField
                  value={conditionPoints}
                  onChange={(
                    e: React.ChangeEvent<HTMLInputElement> | number
                  ) => {
                    const val =
                      typeof e === "object" && "target" in e
                        ? e.target.value
                        : e
                    setConditionPoints(
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

              <Grid item xs={4}>
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
            </Grid>
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
