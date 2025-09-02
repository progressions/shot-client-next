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
import { FaTimes } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import {
  VehicleHeader,
  ChaseConditionPoints,
  Vehicle,
  VehicleEditDialog,
} from "@/components/encounters"
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

  const handleEditClick = () => {
    setEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
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
          pr: 0,
        }}
      >
        <ListItemIcon sx={{ mt: 0 }}>
          <ChaseConditionPoints vehicle={vehicle} />
        </ListItemIcon>
        <ListItemText
          sx={{ ml: 2 }}
          primary={
            <VehicleHeader
              vehicle={vehicle}
              location={vehicle.location}
              onLocationClick={handleLocationClick}
            />
          }
          secondary={<Vehicle vehicle={vehicle} />}
        />
        <Tooltip title="Edit vehicle details">
          <IconButton
            onClick={handleEditClick}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 40,
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            <MdEdit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove from encounter">
          <IconButton
            aria-label="remove"
            onClick={handleRemoveClick}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "text.secondary",
              "&:hover": {
                color: "error.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            <FaTimes />
          </IconButton>
        </Tooltip>
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
