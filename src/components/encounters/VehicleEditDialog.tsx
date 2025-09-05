"use client"

import { useState, useEffect } from "react"
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
} from "@mui/material"
import { NumberField, TextField } from "@/components/ui"
import { useClient, useToast, useEncounter } from "@/contexts"
import type { Vehicle } from "@/types"

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
  const [loading, setLoading] = useState(false)

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
    }
  }, [open, vehicle])

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
        impairments: number
      }

      const vehicleUpdate: VehicleUpdate = {
        name: name.trim(),
        action_values: {
          ...vehicle.action_values,
          "Chase Points": chasePoints,
          "Condition Points": conditionPoints,
        },
        impairments: impairments,
      }

      // If vehicle is in a fight, update through the encounter system for proper broadcasts
      if (encounter && vehicle.shot_id) {
        // First update the vehicle model
        await client.updateVehicleCombatStats(vehicle.id, vehicleUpdate)
        
        // Then update the shot to trigger encounter broadcast
        interface ShotUpdate {
          shot_id: string
          current_shot: number | null
          impairments?: number
        }

        const shotUpdate: ShotUpdate = {
          shot_id: vehicle.shot_id,
          current_shot: null, // Vehicles don't use current_shot
          impairments: impairments,
        }

        // Update shot - this will trigger encounter broadcast
        await client.updateVehicleShot(encounter, vehicle, shotUpdate)
      } else {
        // Not in a fight, just update the vehicle model
        await client.updateVehicleCombatStats(vehicle.id, vehicleUpdate)
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
