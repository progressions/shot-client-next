"use client"

import { useState } from "react"
import { motion } from "motion/react"
import type { Character } from "@/types"
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
import { FaTimes, FaMapMarkerAlt, FaEdit } from "react-icons/fa"
import {
  CharacterHeader,
  Wounds,
  Actions,
  ActionValues,
} from "@/components/encounters"
import CharacterEffectsDisplay from "./effects/CharacterEffectsDisplay"
import { encounterTransition } from "@/contexts/EncounterContext"
import { useEncounter, useClient, useToast } from "@/contexts"

type CharacterDetailProps = {
  character: Character
}

export default function CharacterDetail({ character }: CharacterDetailProps) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [locationDialogOpen, setLocationDialogOpen] = useState(false)
  const [newLocation, setNewLocation] = useState(character.location || "")

  const handleRemoveClick = () => {
    setConfirmOpen(true)
  }

  const handleConfirmRemove = async () => {
    setConfirmOpen(false)
    try {
      // Remove the character from the fight using shot_id
      await client.removeCharacterFromFight(encounter, character)

      // Refresh the encounter to get updated state
      const response = await client.getEncounter(encounter)
      if (response.data) {
        // The encounter update will be handled by the context via WebSocket
        toastSuccess(`Removed ${character.name} from the encounter`)
      }
    } catch (error) {
      console.error("Error removing character from encounter:", error)
      toastError(`Failed to remove ${character.name} from the encounter`)
    }
  }

  const handleCancelRemove = () => {
    setConfirmOpen(false)
  }

  const handleLocationClick = () => {
    setNewLocation(character.location || "")
    setLocationDialogOpen(true)
  }

  const handleLocationClose = () => {
    setLocationDialogOpen(false)
  }

  const handleLocationSave = async () => {
    try {
      // Update the shot location
      await client.updateShotLocation(encounter, character.shot_id, newLocation)
      toastSuccess(`Updated location for ${character.name}`)
      setLocationDialogOpen(false)
    } catch (error) {
      console.error("Error updating location:", error)
      toastError(`Failed to update location for ${character.name}`)
    }
  }

  return (
    <motion.div
      key={`${character.id}-${character.shot_id}`}
      layout
      layoutId={`character-${character.id}-${character.shot_id}`}
      transition={encounterTransition}
    >
      <ListItem
        sx={{
          alignItems: "flex-start",
          position: "relative",
          pr: 0,
          "& .MuiListItemSecondaryAction-root": {
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
          },
        }}
        secondaryAction={<Actions entity={character} />}
      >
        <ListItemIcon sx={{ mt: 0 }}>
          <Wounds character={character} />
        </ListItemIcon>
        <ListItemText
          sx={{ ml: 2 }}
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CharacterHeader character={character} />
              {character.location && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontStyle: "italic",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <FaMapMarkerAlt size={12} />
                  {character.location}
                </Typography>
              )}
              <IconButton
                size="small"
                onClick={handleLocationClick}
                sx={{ ml: 1, p: 0.5 }}
              >
                <FaEdit size={12} />
              </IconButton>
            </Box>
          }
          secondary={
            <Box
              component="span"
              sx={{ display: "flex", flexDirection: "column", gap: 1 }}
            >
              <ActionValues character={character} />
              <CharacterEffectsDisplay
                character={character}
                effects={character.effects || []}
              />
            </Box>
          }
        />
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
          Remove Character from Encounter?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove {character.name} from this
            encounter? This will remove them from the current fight sequence.
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
              Where is {character.name}?
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Location"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              placeholder="e.g., Behind cover, On the roof, In the car"
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
    </motion.div>
  )
}
