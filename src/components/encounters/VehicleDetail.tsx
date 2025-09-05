"use client"

import { useState } from "react"
import { motion } from "motion/react"
import type { Vehicle } from "@/types"
import {
  ListItemIcon,
  ListItemText,
  ListItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
} from "@mui/material"
import { FaTimes, FaEyeSlash, FaEye } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import {
  VehicleHeader,
  ChaseConditionPoints,
  Vehicle,
  VehicleEditDialog,
  Actions,
} from "@/components/encounters"
import { CharacterLink } from "@/components/ui/links"
import { encounterTransition } from "@/contexts/EncounterContext"
import { useEncounter, useClient, useToast } from "@/contexts"

type VehicleDetailProps = {
  vehicle: Vehicle
}

export default function VehicleDetail({ vehicle }: VehicleDetailProps) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [newLocation, setNewLocation] = useState(vehicle.location || "")

  console.log("encounter, vehicle", { encounter, vehicle })

  // Check if vehicle is hidden (current_shot is null)
  const vehicleWithShot = vehicle as Vehicle & {
    current_shot?: number | string | null
  }
  const isHidden =
    vehicleWithShot.current_shot === null ||
    vehicleWithShot.current_shot === undefined

  const handleEditClick = () => {
    setEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
  }

  const handleHideClick = async () => {
    try {
      // Update shot to null to hide the vehicle
      await client.updateVehicleShot(encounter, vehicle, {
        shot_id: vehicle.shot_id,
        current_shot: null,
      })
      toastSuccess(`${vehicle.name} is now hidden`)
    } catch (error) {
      console.error("Error hiding vehicle:", error)
      toastError(`Failed to hide ${vehicle.name}`)
    }
  }

  const handleShowClick = async () => {
    try {
      // Update shot to 0 to show the vehicle
      await client.updateVehicleShot(encounter, vehicle, {
        shot_id: vehicle.shot_id,
        current_shot: 0,
      })
      toastSuccess(`${vehicle.name} is now visible at shot 0`)
    } catch (error) {
      console.error("Error showing vehicle:", error)
      toastError(`Failed to show ${vehicle.name}`)
    }
  }

  const handleRemoveClick = () => {
    setConfirmOpen(true)
  }

  const handleConfirmRemove = async () => {
    setConfirmOpen(false)
    try {
      // Remove the vehicle from the fight using shot_id
      await client.removeVehicleFromFight(encounter, vehicle)

      // Refresh the encounter to get updated state
      const response = await client.getEncounter(encounter)
      if (response.data) {
        // The encounter update will be handled by the context via WebSocket
        toastSuccess(`Removed ${vehicle.name} from the encounter`)
      }
    } catch (error) {
      console.error("Error removing vehicle from encounter:", error)
      toastError(`Failed to remove ${vehicle.name} from the encounter`)
    }
  }

  const handleCancelRemove = () => {
    setConfirmOpen(false)
  }

  const handleLocationClick = () => {
    setNewLocation(vehicle.location || "")
    setLocationDialogOpen(true)
  }

  const handleLocationClose = () => {
    setLocationDialogOpen(false)
  }

  const handleLocationSave = async () => {
    try {
      // Update the shot location
      await client.updateShotLocation(encounter, vehicle.shot_id, newLocation)
      toastSuccess(`Updated location for ${vehicle.name}`)
      setLocationDialogOpen(false)
    } catch (error) {
      console.error("Error updating location:", error)
      toastError(`Failed to update location for ${vehicle.name}`)
    }
  }

  return (
    <motion.div
      key={`${vehicle.id}-${vehicle.shot_id}`}
      layout
      layoutId={`vehicle-${vehicle.id}-${vehicle.shot_id}`}
      transition={encounterTransition}
    >
      <ListItem
        sx={{
          alignItems: "flex-start",
          position: "relative",
          pr: { xs: 0, sm: 0 },
          pl: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 1.5 },
          "& .MuiListItemSecondaryAction-root": {
            right: 0,
            top: { xs: "8px", sm: "50%" },
            transform: { xs: "none", sm: "translateY(-50%)" },
          },
        }}
        secondaryAction={
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Actions entity={vehicle} />
          </Box>
        }
      >
        <ListItemIcon
          sx={{
            mt: 0,
            minWidth: { xs: 40, sm: 56 },
            mr: { xs: 1, sm: 0 },
          }}
        >
          <ChaseConditionPoints vehicle={vehicle} />
        </ListItemIcon>
        <ListItemText
          sx={{ ml: { xs: 0.5, sm: 2 }, pr: { xs: 10, sm: 0 } }}
          primary={
            <VehicleHeader
              vehicle={vehicle}
              location={vehicle.location}
              onLocationClick={handleLocationClick}
            />
          }
          secondary={
            <Box component="span" sx={{ display: "block", mt: 0.5 }}>
              <Vehicle vehicle={vehicle} />
              {vehicle.driver && (
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    color: "info.main",
                    fontStyle: "italic",
                  }}
                >
                  Driven by <CharacterLink character={vehicle.driver} />
                </Typography>
              )}
            </Box>
          }
        />
        <Box
          sx={{
            position: "absolute",
            top: { xs: 4, sm: 8 },
            right: { xs: 4, sm: 8 },
            display: "flex",
            gap: { xs: 0.25, sm: 0.5 },
          }}
        >
          <Tooltip title="Edit vehicle details">
            <IconButton
              aria-label="edit"
              onClick={handleEditClick}
              size="small"
              sx={{
                p: { xs: 0.5, sm: 1 },
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              <MdEdit size={16} />
            </IconButton>
          </Tooltip>
          {isHidden ? (
            <Tooltip title="Show vehicle">
              <IconButton
                aria-label="show"
                onClick={handleShowClick}
                size="small"
                sx={{
                  p: { xs: 0.5, sm: 1 },
                  color: "text.secondary",
                  "&:hover": {
                    color: "success.main",
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <FaEye size={16} />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Hide vehicle">
              <IconButton
                aria-label="hide"
                onClick={handleHideClick}
                size="small"
                sx={{
                  p: { xs: 0.5, sm: 1 },
                  color: "text.secondary",
                  "&:hover": {
                    color: "warning.main",
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <FaEyeSlash size={16} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Remove from encounter">
            <IconButton
              aria-label="remove"
              onClick={handleRemoveClick}
              size="small"
              sx={{
                p: { xs: 0.5, sm: 1 },
                color: "text.secondary",
                "&:hover": {
                  color: "error.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              <FaTimes size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItem>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCancelRemove}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Remove Vehicle from Encounter?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove {vehicle.name} from this encounter?
            This will remove it from the current fight sequence.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmRemove} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* Location Edit Dialog */}
      <Dialog
        open={locationDialogOpen}
        onClose={handleLocationClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Location</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Where is {vehicle.name}?
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Location"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleLocationSave()
                }
              }}
              inputProps={{
                onFocus: e => {
                  // Small delay to ensure the field is ready
                  setTimeout(() => e.target.select(), 0)
                },
              }}
              placeholder="e.g., On the highway, In pursuit, At the dock"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLocationClose}>Cancel</Button>
          <Button onClick={handleLocationSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Vehicle Edit Dialog */}
      <VehicleEditDialog
        open={editDialogOpen}
        onClose={handleEditClose}
        vehicle={vehicle}
      />
    </motion.div>
  )
}
