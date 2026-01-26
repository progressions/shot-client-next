"use client"

import { useMemo, useState, useCallback } from "react"
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material"
import { Close as CloseIcon } from "@mui/icons-material"
import { FaMapLocationDot } from "react-icons/fa6"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core"
import { useEncounter, useClient, useToast } from "@/contexts"
import { useLocations } from "@/hooks"
import type { LocationShot } from "@/types"
import BasePanel from "../BasePanel"
import LocationZone from "./LocationZone"
import UnassignedZone from "./UnassignedZone"
import LocationCharacterAvatar from "./LocationCharacterAvatar"

interface LocationsPanelProps {
  onClose: () => void
}

/**
 * LocationsPanel displays all fight locations as visual zones.
 * Characters/vehicles can be dragged between locations.
 *
 * Phase 2: Drag-and-drop support for moving characters between zones.
 */
export default function LocationsPanel({ onClose }: LocationsPanelProps) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const fightId = encounter?.id
  const { locations, loading, error } = useLocations(fightId)

  // Track the currently dragged shot for DragOverlay
  const [activeDragShot, setActiveDragShot] = useState<LocationShot | null>(
    null
  )

  // Track optimistic location overrides: shotId -> locationId (null = unassigned)
  // This allows instant UI updates while the API call happens in the background
  const [locationOverrides, setLocationOverrides] = useState<
    Map<string, string | null>
  >(new Map())

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to start drag
      },
    })
  )

  // Get all characters from the encounter (including hidden ones)
  // We need ALL characters to map location shots to their names
  const allCharacters = useMemo(() => {
    if (!encounter?.shots) return []

    const characters: Array<{
      character?: {
        id: string
        name: string
        shot_id: string
        image_url?: string | null
        character_type?: string
        count?: number
      }
      vehicle?: {
        id: string
        name: string
        shot_id?: string
        image_url?: string | null
      }
      shot: number | null
    }> = []

    encounter.shots.forEach((shotGroup: Record<string, unknown>) => {
      const shotNumber = shotGroup.shot as number | null

      // Get characters from this shot group
      if (shotGroup.characters && Array.isArray(shotGroup.characters)) {
        shotGroup.characters.forEach((char: Record<string, unknown>) => {
          characters.push({
            character: {
              id: char.id as string,
              name: char.name as string,
              shot_id: char.shot_id as string,
              image_url: char.image_url as string | null | undefined,
              character_type: char.character_type as string | undefined,
              count: char.count as number | undefined,
            },
            shot: shotNumber,
          })
        })
      }

      // Get vehicles from this shot group
      if (shotGroup.vehicles && Array.isArray(shotGroup.vehicles)) {
        shotGroup.vehicles.forEach((veh: Record<string, unknown>) => {
          characters.push({
            vehicle: {
              id: veh.id as string,
              name: veh.name as string,
              shot_id: veh.shot_id as string | undefined,
              image_url: veh.image_url as string | null | undefined,
            },
            shot: shotNumber,
          })
        })
      }
    })

    return characters
  }, [encounter?.shots])

  // Build a lookup map from shot_id to full character/vehicle data
  const characterDataMap = useMemo(() => {
    const map = new Map<
      string,
      {
        character?: {
          id: string
          name: string
          image_url?: string
          character_type?: string
          count?: number
        }
        vehicle?: {
          id: string
          name: string
          image_url?: string
        }
        shot: number | null
      }
    >()

    allCharacters.forEach(item => {
      // Map by shot_id (which is what locations API returns as shot.id)
      if (item.character?.shot_id) {
        map.set(item.character.shot_id, {
          character: {
            id: item.character.id,
            name: item.character.name,
            image_url: item.character.image_url || undefined,
            character_type: item.character.character_type,
            count: item.character.count,
          },
          shot: item.shot,
        })
      }
      if (item.vehicle?.shot_id) {
        map.set(item.vehicle.shot_id, {
          vehicle: {
            id: item.vehicle.id,
            name: item.vehicle.name,
            image_url: item.vehicle.image_url || undefined,
          },
          shot: item.shot,
        })
      }
    })

    return map
  }, [allCharacters])

  // Enrich locations with full character/vehicle data from encounter
  // Merge objects to preserve any backend-supplied data while enriching from encounter
  const enrichedLocations = useMemo(() => {
    return locations.map(loc => ({
      ...loc,
      shots: loc.shots?.map(shot => {
        const enrichedData = characterDataMap.get(shot.id)
        const mergedCharacter =
          shot.character || enrichedData?.character
            ? {
                ...(shot.character || {}),
                ...(enrichedData?.character || {}),
              }
            : undefined
        const mergedVehicle =
          shot.vehicle || enrichedData?.vehicle
            ? {
                ...(shot.vehicle || {}),
                ...(enrichedData?.vehicle || {}),
              }
            : undefined
        return {
          ...shot,
          character: mergedCharacter,
          vehicle: mergedVehicle,
          shot: shot.shot ?? enrichedData?.shot ?? null,
        }
      }),
    }))
  }, [locations, characterDataMap])

  // Find unassigned characters (those with no location_id)
  const unassignedShots: LocationShot[] = useMemo(() => {
    // Get all shot IDs that are assigned to locations
    const assignedShotIds = new Set<string>()
    enrichedLocations.forEach(loc => {
      loc.shots?.forEach(shot => {
        assignedShotIds.add(shot.id)
      })
    })

    // Filter encounter characters to find unassigned ones
    // Convert to LocationShot format
    return allCharacters
      .filter(item => {
        const shotId = item.character?.shot_id || item.vehicle?.shot_id
        return shotId && !assignedShotIds.has(shotId)
      })
      .map(item => ({
        id: item.character?.shot_id || item.vehicle?.shot_id || "",
        shot: item.shot,
        count: item.character?.count,
        character: item.character
          ? {
              id: item.character.id,
              name: item.character.name,
              image_url: item.character.image_url || undefined,
              character_type: item.character.character_type,
              count: item.character.count,
            }
          : undefined,
        vehicle: item.vehicle
          ? {
              id: item.vehicle.id,
              name: item.vehicle.name,
              image_url: item.vehicle.image_url || undefined,
            }
          : undefined,
      }))
  }, [allCharacters, enrichedLocations])

  // Apply optimistic overrides to create display data
  // This allows instant UI updates while the API call happens in the background
  const displayData = useMemo(() => {
    if (locationOverrides.size === 0) {
      // No overrides, use data as-is
      return {
        locations: enrichedLocations,
        unassignedShots: unassignedShots,
      }
    }

    // Collect all shots from all sources for easy lookup
    const allShots = new Map<string, LocationShot>()
    enrichedLocations.forEach(loc => {
      loc.shots?.forEach(shot => allShots.set(shot.id, shot))
    })
    unassignedShots.forEach(shot => allShots.set(shot.id, shot))

    // Build new locations with overrides applied
    const newLocations = enrichedLocations.map(loc => {
      // Start with shots that belong here and haven't been moved away
      const remainingShots =
        loc.shots?.filter(shot => {
          if (locationOverrides.has(shot.id)) {
            // Shot has override - only keep if override points to this location
            return locationOverrides.get(shot.id) === loc.id
          }
          return true // No override, keep in original location
        }) || []

      // Add shots that have been moved TO this location
      const incomingShots: LocationShot[] = []
      locationOverrides.forEach((targetLocId, shotId) => {
        if (targetLocId === loc.id) {
          // This shot was moved to this location
          const shot = allShots.get(shotId)
          // Only add if not already in remainingShots
          if (shot && !remainingShots.some(s => s.id === shotId)) {
            incomingShots.push(shot)
          }
        }
      })

      return {
        ...loc,
        shots: [...remainingShots, ...incomingShots],
      }
    })

    // Build new unassigned list with overrides applied
    const newUnassigned = unassignedShots.filter(shot => {
      if (locationOverrides.has(shot.id)) {
        // Shot has override - only keep if override is null (unassigned)
        return locationOverrides.get(shot.id) === null
      }
      return true // No override, keep in unassigned
    })

    // Add shots that have been moved TO unassigned
    locationOverrides.forEach((targetLocId, shotId) => {
      if (targetLocId === null) {
        const shot = allShots.get(shotId)
        // Only add if not already in newUnassigned
        if (shot && !newUnassigned.some(s => s.id === shotId)) {
          newUnassigned.push(shot)
        }
      }
    })

    return {
      locations: newLocations,
      unassignedShots: newUnassigned,
    }
  }, [enrichedLocations, unassignedShots, locationOverrides])

  // Find a shot by its ID from all available shots
  const findShotById = useCallback(
    (shotId: string): LocationShot | null => {
      // Check assigned locations
      for (const loc of displayData.locations) {
        const shot = loc.shots?.find(s => s.id === shotId)
        if (shot) return shot
      }
      // Check unassigned
      const unassigned = displayData.unassignedShots.find(s => s.id === shotId)
      if (unassigned) return unassigned
      return null
    },
    [displayData]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const shotId = event.active.id as string
    const shot = findShotById(shotId)
    setActiveDragShot(shot)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    // Get entity name before clearing drag state
    const draggedShot = activeDragShot
    setActiveDragShot(null)

    if (!over || !fightId) return

    const shotId = active.id as string
    const targetId = over.id as string

    // Determine the new location_id
    // "unassigned" means set to null, otherwise it's a location ID
    const newLocationId = targetId === "unassigned" ? null : targetId

    // Find the current location of the shot to avoid unnecessary updates
    let currentLocationId: string | null = null
    for (const loc of displayData.locations) {
      if (loc.shots?.some(s => s.id === shotId)) {
        currentLocationId = loc.id
        break
      }
    }
    // If shot is in unassigned, currentLocationId stays null

    // Don't update if dropping in the same location
    if (newLocationId === currentLocationId) return

    // Get names for toast message before the move
    const entityName =
      draggedShot?.character?.name || draggedShot?.vehicle?.name || "Character"
    const locationName =
      newLocationId === null
        ? "Unassigned"
        : displayData.locations.find(l => l.id === newLocationId)?.name ||
          "location"

    // Capture the previous override value (if any) to restore on failure
    // This handles the case where a previous successful move set an override
    const previousOverride = locationOverrides.get(shotId)
    const hasPreviousOverride = locationOverrides.has(shotId)

    // Apply optimistic update immediately
    setLocationOverrides(prev => {
      const next = new Map(prev)
      next.set(shotId, newLocationId)
      return next
    })

    try {
      // Make API call in the background
      await client.updateShotLocationById(fightId, shotId, newLocationId)

      // Don't clear override or refetch - the optimistic state is correct
      // and clearing/refetching causes a visual flicker
      toastSuccess(`${entityName} moved to ${locationName}`)
    } catch (err) {
      console.error("Failed to update location:", err)

      // Revert to the previous override state, not just delete
      // This preserves the last successful location if there was one
      setLocationOverrides(prev => {
        const next = new Map(prev)
        if (hasPreviousOverride) {
          // Restore the previous override (last successful location)
          next.set(shotId, previousOverride as string | null)
        } else {
          // No previous override, remove entirely to show original server state
          next.delete(shotId)
        }
        return next
      })

      toastError("Failed to move character")
    }
  }

  const handleCharacterClick = (shot: LocationShot) => {
    // TODO: In future phases, this could open character details
    if (process.env.NODE_ENV === "development") {
      console.log("Character clicked:", shot)
    }
  }

  if (loading) {
    return (
      <BasePanel
        title="Locations"
        icon={<FaMapLocationDot />}
        borderColor="info.main"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <CircularProgress />
        </Box>
      </BasePanel>
    )
  }

  if (error) {
    return (
      <BasePanel
        title="Locations"
        icon={<FaMapLocationDot />}
        borderColor="error.main"
      >
        <Alert severity="error">{error}</Alert>
      </BasePanel>
    )
  }

  return (
    <BasePanel
      title="Locations"
      icon={<FaMapLocationDot />}
      borderColor="info.main"
      sx={{ position: "relative" }}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
      >
        <CloseIcon />
      </IconButton>

      {displayData.locations.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No locations have been created for this fight yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Locations can be added to organize where characters are positioned
            during combat.
          </Typography>
        </Box>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Grid layout for locations - handles variable heights naturally */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
              backgroundColor: "grey.100",
              borderRadius: 1,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {displayData.locations.map(location => (
              <LocationZone
                key={location.id}
                location={location}
                onCharacterClick={handleCharacterClick}
              />
            ))}
          </Box>

          {/* Unassigned zone below the canvas */}
          <UnassignedZone
            shots={displayData.unassignedShots}
            onCharacterClick={handleCharacterClick}
          />

          {/* Drag overlay - shows the dragged item */}
          <DragOverlay>
            {activeDragShot ? (
              <LocationCharacterAvatar shot={activeDragShot} isDragOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </BasePanel>
  )
}
