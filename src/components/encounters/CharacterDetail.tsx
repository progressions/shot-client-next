"use client"

import { useState, useMemo } from "react"
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
  Chip,
} from "@mui/material"
import { FaTimes, FaEyeSlash, FaEye, FaHeart } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import {
  CharacterHeader,
  Wounds,
  Actions,
  ActionValues,
  CharacterEditDialog,
  VehicleEditDialog,
  VehicleActionValues,
  ChaseConditionPoints,
  HealDialog,
} from "@/components/encounters"
import { VehicleAvatar } from "@/components/avatars"
import CharacterEffectsDisplay from "./effects/CharacterEffectsDisplay"
import { VehicleLink } from "@/components/ui/links"
import { encounterTransition } from "@/contexts/EncounterContext"
import { useEncounter, useClient, useToast } from "@/contexts"
import { VS } from "@/services"

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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [vehicleEditDialogOpen, setVehicleEditDialogOpen] = useState(false)
  const [healDialogOpen, setHealDialogOpen] = useState(false)

  // Use the vehicle data from character.driving which now has full data from serializer
  const drivingVehicle = useMemo(() => {
    return character.driving || null
  }, [character.driving])

  // Check if character is hidden (current_shot is null)
  const characterWithShot = character as Character & {
    current_shot?: number | string | null
  }
  const isHidden =
    characterWithShot.current_shot === null ||
    characterWithShot.current_shot === undefined

  const handleEditClick = () => {
    setEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
  }

  const handleVehicleEditClick = () => {
    setVehicleEditDialogOpen(true)
  }

  const handleVehicleEditClose = () => {
    setVehicleEditDialogOpen(false)
  }

  const handleHealClick = () => {
    setHealDialogOpen(true)
  }

  const handleHealClose = () => {
    setHealDialogOpen(false)
  }

  const handleHideClick = async () => {
    try {
      // Update shot to null to hide the character
      await client.updateCharacterShot(encounter, character, {
        shot_id: character.shot_id,
        current_shot: null,
      })
      toastSuccess(`${character.name} is now hidden`)
    } catch (error) {
      console.error("Error hiding character:", error)
      toastError(`Failed to hide ${character.name}`)
    }
  }

  const handleShowClick = async () => {
    try {
      // Update shot to 0 to show the character
      await client.updateCharacterShot(encounter, character, {
        shot_id: character.shot_id,
        current_shot: 0,
      })
      toastSuccess(`${character.name} is now visible at shot 0`)
    } catch (error) {
      console.error("Error showing character:", error)
      toastError(`Failed to show ${character.name}`)
    }
  }

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
          pr: { xs: 0, sm: 0 },
          pl: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 1.5 },
        }}
      >
        <ListItemIcon
          sx={{
            mt: 0,
            minWidth: { xs: 40, sm: 56 },
            mr: { xs: 1, sm: 0 },
            p: 0,
          }}
        >
          <Wounds character={character} />
        </ListItemIcon>
        <ListItemText
          sx={{ ml: { xs: 0.5, sm: 2 }, pr: { xs: 10, sm: 0 } }}
          primary={
            <CharacterHeader
              character={character}
              location={character.location}
              onLocationClick={handleLocationClick}
            />
          }
          secondary={
            <>
              <ActionValues character={character} />
              {drivingVehicle && (
                <Box
                  sx={{
                    display: "block",
                    mt: 1,
                    p: 1,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontStyle: "italic",
                        display: "block",
                        mb: 0.5,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Driving
                    </Typography>
                    <Tooltip title="Edit vehicle">
                      <IconButton
                        size="small"
                        onClick={handleVehicleEditClick}
                        sx={{
                          p: 0.25,
                          color: "text.secondary",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      >
                        <MdEdit size={14} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <VehicleAvatar entity={drivingVehicle} />
                    <VehicleLink vehicle={drivingVehicle} />
                    {VS.isDefeated(drivingVehicle) &&
                      VS.getDefeatType(drivingVehicle) && (
                        <Chip
                          label={
                            VS.getDefeatType(drivingVehicle) === "crashed"
                              ? "CRASHED"
                              : "BOXED IN"
                          }
                          color={
                            VS.getDefeatType(drivingVehicle) === "crashed"
                              ? "error"
                              : "warning"
                          }
                          size="small"
                          sx={{
                            height: "20px",
                            fontSize: "0.65rem",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                          }}
                        />
                      )}
                  </Box>
                  <VehicleActionValues vehicle={drivingVehicle} />
                  <Box sx={{ mt: 1 }}>
                    <ChaseConditionPoints vehicle={drivingVehicle} />
                  </Box>
                </Box>
              )}
              <CharacterEffectsDisplay
                character={character}
                effects={character.effects || []}
              />
            </>
          }
          secondaryTypographyProps={{
            component: "div",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: { xs: 4, sm: 8 },
            right: { xs: 4, sm: 8 },
            display: "flex",
            flexDirection: "row",
            gap: { xs: 0.25, sm: 0.5 },
            alignItems: "flex-end",
          }}
        >
          <Tooltip title="Edit character details">
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
          <Tooltip title="Heal wounds">
            <IconButton
              aria-label="heal"
              onClick={handleHealClick}
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
              <FaHeart size={16} />
            </IconButton>
          </Tooltip>
          {isHidden ? (
            <Tooltip title="Show character">
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
            <Tooltip title="Hide character">
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
          <Actions entity={character} />
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

      {/* Character Edit Dialog */}
      <CharacterEditDialog
        open={editDialogOpen}
        onClose={handleEditClose}
        character={character}
      />

      {/* Vehicle Edit Dialog */}
      {drivingVehicle && (
        <VehicleEditDialog
          open={vehicleEditDialogOpen}
          onClose={handleVehicleEditClose}
          vehicle={drivingVehicle}
        />
      )}

      {/* Heal Dialog */}
      <HealDialog
        open={healDialogOpen}
        onClose={handleHealClose}
        character={character}
      />
    </motion.div>
  )
}
