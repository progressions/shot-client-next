"use client"
import { useMemo } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material"
import { useEncounter } from "@/contexts"
import FightService from "@/services/FightService"
import { CharacterLink } from "@/components/ui"
import type { Character, Vehicle } from "@/types"

type LocationsDialogProps = {
  open: boolean
  onClose: () => void
}

export default function LocationsDialog({ open, onClose }: LocationsDialogProps) {
  const { encounter } = useEncounter()

  const locationGroups = useMemo(() => {
    // Get all characters and vehicles from the fight
    const characters = FightService.charactersInFight(encounter)
    const vehicles = FightService.vehiclesInFight(encounter)
    
    // Group entities by location
    const groups = new Map<string, (Character | Vehicle)[]>()
    
    // Process characters
    characters.forEach(character => {
      const location = character.location || "No Location"
      if (!groups.has(location)) {
        groups.set(location, [])
      }
      groups.get(location)!.push(character)
    })
    
    // Process vehicles
    vehicles.forEach(vehicle => {
      const location = vehicle.location || "No Location"
      if (!groups.has(location)) {
        groups.set(location, [])
      }
      groups.get(location)!.push(vehicle)
    })
    
    // Convert to sorted array - sort locations alphabetically
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
      // Put "No Location" at the end
      if (a[0] === "No Location") return 1
      if (b[0] === "No Location") return -1
      return a[0].localeCompare(b[0])
    })
    
    // Sort entities within each location by name
    sortedGroups.forEach(([location, entities]) => {
      entities.sort((a, b) => a.name.localeCompare(b.name))
    })
    
    return sortedGroups
  }, [encounter])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Locations</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {locationGroups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No characters or vehicles in this encounter
            </Typography>
          ) : (
            locationGroups.map(([location, entities]) => (
              <Box key={location} sx={{ mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "bold",
                    color: location === "No Location" ? "text.secondary" : "text.primary",
                    mb: 0.5,
                  }}
                >
                  {location}
                </Typography>
                <List dense sx={{ pl: 1.5, py: 0 }}>
                  {entities.map(entity => (
                    <ListItem key={`${entity.id}-${entity.shot_id}`} sx={{ py: 0, px: 1 }}>
                      <ListItemText
                        sx={{ my: 0 }}
                        primary={
                          "archetype" in entity ? (
                            <CharacterLink character={entity as Character} />
                          ) : (
                            <Typography variant="body2">{entity.name}</Typography>
                          )
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}