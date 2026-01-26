"use client"

import { useMemo, useState, useCallback, useRef, useEffect } from "react"
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Button,
} from "@mui/material"
import {
  Close as CloseIcon,
  GridView as GridIcon,
  Map as CanvasIcon,
  Add as AddIcon,
  Timeline as ConnectIcon,
} from "@mui/icons-material"
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
import {
  useLocations,
  useDebouncedLocationUpdate,
  useLocationConnections,
} from "@/hooks"
import { FormActions } from "@/reducers"
import type {
  Location,
  LocationShot,
  Encounter,
  LocationConnection,
} from "@/types"
import BasePanel from "../BasePanel"
import LocationZone from "./LocationZone"
import UnassignedZone from "./UnassignedZone"
import LocationCharacterAvatar from "./LocationCharacterAvatar"
import LocationFormDialog from "./LocationFormDialog"
import ConnectionsLayer from "./ConnectionsLayer"
import ConnectionHandle from "./ConnectionHandle"
import ConnectionPopover from "./ConnectionPopover"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import {
  CANVAS_MIN_WIDTH,
  CANVAS_MIN_HEIGHT,
  DEFAULT_ZONE_WIDTH,
  DEFAULT_ZONE_HEIGHT,
  ZONE_SPACING,
  COLLISION_PADDING,
} from "./constants"

interface LocationsPanelProps {
  onClose: () => void
}

type ViewMode = "grid" | "canvas"

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Check if two rectangles overlap (with optional padding)
 */
function rectsOverlap(a: Rect, b: Rect, padding: number = 0): boolean {
  return !(
    a.x + a.width + padding <= b.x ||
    b.x + b.width + padding <= a.x ||
    a.y + a.height + padding <= b.y ||
    b.y + b.height + padding <= a.y
  )
}

/**
 * LocationsPanel displays all fight locations as visual zones.
 * Characters/vehicles can be dragged between locations.
 *
 * Phase 2: Drag-and-drop support for moving characters between zones.
 * Phase 3: Canvas mode with draggable/resizable zones.
 */
export default function LocationsPanel({ onClose }: LocationsPanelProps) {
  const { encounter, dispatchEncounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const fightId = encounter?.id
  const { locations, loading, error } = useLocations(fightId)
  const { connections } = useLocationConnections(fightId)
  const { queueUpdate, flushUpdate } = useDebouncedLocationUpdate(500)

  // View mode state - persist in localStorage, default to "canvas" for visual layout
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("locationsPanel.viewMode")
      if (saved === "grid" || saved === "canvas") return saved
    }
    return "canvas"
  })

  // Persist view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("locationsPanel.viewMode", viewMode)
  }, [viewMode])

  // Connection mode state
  const [connectionMode, setConnectionMode] = useState(false)
  const [pendingConnection, setPendingConnection] = useState<string | null>(
    null
  ) // from_location_id
  const [selectedConnection, setSelectedConnection] =
    useState<LocationConnection | null>(null)
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [isNewConnection, setIsNewConnection] = useState(false)
  const [previewLine, setPreviewLine] = useState<{
    fromLocationId: string
    toPoint: { x: number; y: number }
  } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const lastMouseMoveTime = useRef<number>(0)
  const tempAnchorRef = useRef<HTMLDivElement | null>(null)

  // Track the currently dragged shot for DragOverlay
  const [activeDragShot, setActiveDragShot] = useState<LocationShot | null>(
    null
  )

  // Track optimistic location overrides: shotId -> locationId (null = unassigned)
  // This allows instant UI updates while the API call happens in the background
  const [locationOverrides, setLocationOverrides] = useState<
    Map<string, string | null>
  >(new Map())

  // Track local position/size overrides for optimistic updates during drag/resize
  const [positionOverrides, setPositionOverrides] = useState<
    Map<string, { x?: number; y?: number; width?: number; height?: number }>
  >(new Map())

  // Dialog state for add/edit/delete
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(
    null
  )

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

  // Enrich locations with full character/vehicle data and position overrides
  const enrichedLocations = useMemo(() => {
    return locations.map(loc => {
      const override = loc.id ? positionOverrides.get(loc.id) : undefined
      return {
        ...loc,
        position_x: override?.x ?? loc.position_x ?? 0,
        position_y: override?.y ?? loc.position_y ?? 0,
        width: override?.width ?? loc.width ?? DEFAULT_ZONE_WIDTH,
        height: override?.height ?? loc.height ?? DEFAULT_ZONE_HEIGHT,
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
      }
    })
  }, [locations, characterDataMap, positionOverrides])

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

  // Memoize handle positions to avoid recalculating on every render
  const handlePositions = useMemo(() => {
    return displayData.locations
      .filter(loc => loc.id)
      .map(loc => ({
        locationId: loc.id!,
        centerX: (loc.position_x ?? 0) + (loc.width ?? DEFAULT_ZONE_WIDTH) / 2,
        centerY:
          (loc.position_y ?? 0) + (loc.height ?? DEFAULT_ZONE_HEIGHT) / 2,
      }))
  }, [displayData.locations])

  // Calculate canvas dimensions based on zone positions
  const canvasDimensions = useMemo(() => {
    let maxX = CANVAS_MIN_WIDTH
    let maxY = CANVAS_MIN_HEIGHT

    displayData.locations.forEach(loc => {
      const right =
        (loc.position_x ?? 0) + (loc.width ?? DEFAULT_ZONE_WIDTH) + ZONE_SPACING
      const bottom =
        (loc.position_y ?? 0) +
        (loc.height ?? DEFAULT_ZONE_HEIGHT) +
        ZONE_SPACING
      maxX = Math.max(maxX, right)
      maxY = Math.max(maxY, bottom)
    })

    return { width: maxX, height: maxY }
  }, [displayData.locations])

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
        currentLocationId = loc.id!
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

      // Update the encounter context so other components get the new location data
      // We keep the optimistic override in place so LocationsPanel doesn't flicker
      // Note: We use dispatchEncounter directly with name: "encounter" because
      // the context's updateEntity dispatches to name: "entity" which is wrong
      const encounterResponse = await client.getEncounter(encounter)
      if (encounterResponse.data) {
        dispatchEncounter({
          type: FormActions.UPDATE,
          name: "encounter",
          value: encounterResponse.data as Encounter,
        })
      }

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

  // Check if a zone would overlap with any other zone
  const wouldOverlap = useCallback(
    (movingLocationId: string, newRect: Rect): boolean => {
      for (const loc of displayData.locations) {
        if (loc.id === movingLocationId) continue

        const otherRect: Rect = {
          x: loc.position_x ?? 0,
          y: loc.position_y ?? 0,
          width: loc.width ?? DEFAULT_ZONE_WIDTH,
          height: loc.height ?? DEFAULT_ZONE_HEIGHT,
        }

        if (rectsOverlap(newRect, otherRect, COLLISION_PADDING)) {
          return true
        }
      }
      return false
    },
    [displayData.locations]
  )

  // Zone position change handler (optimistic update)
  const handlePositionChange = useCallback(
    (location: Location, position: { x: number; y: number }) => {
      if (!location.id) return

      // Check for collision before allowing the move
      const newRect: Rect = {
        x: position.x,
        y: position.y,
        width: location.width ?? DEFAULT_ZONE_WIDTH,
        height: location.height ?? DEFAULT_ZONE_HEIGHT,
      }

      if (wouldOverlap(location.id!, newRect)) {
        // Don't allow the move - zone would overlap
        return
      }

      setPositionOverrides(prev => {
        const next = new Map(prev)
        const existing = next.get(location.id!) || {}
        next.set(location.id!, { ...existing, x: position.x, y: position.y })
        return next
      })

      // Queue debounced save
      queueUpdate(location, {
        position_x: Math.round(position.x),
        position_y: Math.round(position.y),
      })
    },
    [queueUpdate, wouldOverlap]
  )

  // Zone size change handler (optimistic update)
  const handleSizeChange = useCallback(
    (location: Location, size: { width: number; height: number }) => {
      if (!location.id) return

      // Get current position (from overrides or location)
      const currentOverride = positionOverrides.get(location.id)
      const currentX = currentOverride?.x ?? location.position_x ?? 0
      const currentY = currentOverride?.y ?? location.position_y ?? 0

      // Check for collision before allowing the resize
      const newRect: Rect = {
        x: currentX,
        y: currentY,
        width: size.width,
        height: size.height,
      }

      if (wouldOverlap(location.id!, newRect)) {
        // Don't allow the resize - zone would overlap
        return
      }

      setPositionOverrides(prev => {
        const next = new Map(prev)
        const existing = next.get(location.id!) || {}
        next.set(location.id!, {
          ...existing,
          width: size.width,
          height: size.height,
        })
        return next
      })

      // Queue debounced save
      queueUpdate(location, {
        width: Math.round(size.width),
        height: Math.round(size.height),
      })
    },
    [queueUpdate, wouldOverlap, positionOverrides]
  )

  // On drag/resize end, flush the update immediately
  const handleZoneDragEnd = useCallback(
    (location: Location) => {
      if (location.id) {
        flushUpdate(location.id)
      }
    },
    [flushUpdate]
  )

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode)
      // Exit connection mode when switching to grid view
      if (newMode === "grid") {
        setConnectionMode(false)
        setPendingConnection(null)
        setPreviewLine(null)
      }
    }
  }

  // Connection mode handlers
  const toggleConnectionMode = useCallback(() => {
    setConnectionMode(prev => {
      if (prev) {
        // Exiting connection mode - clear state
        setPendingConnection(null)
        setPreviewLine(null)
        setSelectedConnection(null)
      }
      return !prev
    })
  }, [])

  const handleConnectionHandleClick = useCallback(
    (locationId: string) => {
      if (!connectionMode) return

      if (!pendingConnection) {
        // Start connection from this location
        setPendingConnection(locationId)
      } else if (pendingConnection === locationId) {
        // Clicked same location - cancel
        setPendingConnection(null)
        setPreviewLine(null)
      } else {
        // Complete connection to this location
        setIsNewConnection(true)
        setSelectedConnection({
          from_location_id: pendingConnection,
          to_location_id: locationId,
        })
        // Create a temporary anchor element for the popover
        const tempAnchor = document.createElement("div")
        tempAnchor.style.position = "fixed"
        tempAnchor.style.left = `${window.innerWidth / 2}px`
        tempAnchor.style.top = `${window.innerHeight / 2}px`
        tempAnchor.style.width = "0px"
        tempAnchor.style.height = "0px"
        tempAnchor.style.pointerEvents = "none"
        document.body.appendChild(tempAnchor)
        tempAnchorRef.current = tempAnchor
        setPopoverAnchor(tempAnchor)
      }
    },
    [connectionMode, pendingConnection]
  )

  const handleCanvasMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!connectionMode || !pendingConnection || !canvasRef.current) return

      // Throttle mouse move updates to 60fps (16ms) to avoid excessive re-renders
      const now = Date.now()
      if (now - lastMouseMoveTime.current < 16) return
      lastMouseMoveTime.current = now

      const rect = canvasRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      setPreviewLine({
        fromLocationId: pendingConnection,
        toPoint: { x, y },
      })
    },
    [connectionMode, pendingConnection]
  )

  const handleConnectionClick = useCallback(
    (connection: LocationConnection) => {
      setSelectedConnection(connection)
      setIsNewConnection(false)
      // Create a temporary anchor element at the center of the screen
      const tempAnchor = document.createElement("div")
      tempAnchor.style.position = "fixed"
      tempAnchor.style.left = `${window.innerWidth / 2}px`
      tempAnchor.style.top = `${window.innerHeight / 2}px`
      tempAnchor.style.width = "0px"
      tempAnchor.style.height = "0px"
      tempAnchor.style.pointerEvents = "none"
      document.body.appendChild(tempAnchor)
      // Store in ref for cleanup when popover closes
      tempAnchorRef.current = tempAnchor
      setPopoverAnchor(tempAnchor)
    },
    []
  )

  const handleConnectionPopoverClose = useCallback(() => {
    // Clean up temporary anchor element if it exists
    if (tempAnchorRef.current?.parentNode) {
      tempAnchorRef.current.parentNode.removeChild(tempAnchorRef.current)
      tempAnchorRef.current = null
    }
    setPopoverAnchor(null)
    setSelectedConnection(null)
    setIsNewConnection(false)
    setPendingConnection(null)
    setPreviewLine(null)
  }, [])

  const handleConnectionSave = useCallback(
    async (data: { label?: string; bidirectional?: boolean }) => {
      if (!fightId || !selectedConnection) return

      try {
        if (isNewConnection) {
          // Check for duplicate connections before creating
          const fromId = selectedConnection.from_location_id
          const toId = selectedConnection.to_location_id
          const existingConnection = connections.find(
            conn =>
              (conn.from_location_id === fromId &&
                conn.to_location_id === toId) ||
              (conn.bidirectional &&
                conn.from_location_id === toId &&
                conn.to_location_id === fromId)
          )
          if (existingConnection) {
            toastError("A connection between these locations already exists")
            return
          }

          // Creating a new connection
          await client.createFightLocationConnection(fightId, {
            from_location_id: selectedConnection.from_location_id,
            to_location_id: selectedConnection.to_location_id,
            label: data.label,
            bidirectional: data.bidirectional,
          })
          toastSuccess("Connection created")
        } else if (selectedConnection.id) {
          // Updating an existing connection
          await client.updateLocationConnection(selectedConnection.id, {
            label: data.label,
            bidirectional: data.bidirectional,
          })
          toastSuccess("Connection updated")
        }
        handleConnectionPopoverClose()
      } catch (err) {
        console.error("Failed to save connection:", err)
        toastError("Failed to save connection")
      }
    },
    [
      fightId,
      selectedConnection,
      isNewConnection,
      connections,
      client,
      toastSuccess,
      toastError,
      handleConnectionPopoverClose,
    ]
  )

  const handleConnectionDelete = useCallback(async () => {
    if (!selectedConnection?.id) return

    try {
      await client.deleteLocationConnection(selectedConnection.id)
      toastSuccess("Connection deleted")
      handleConnectionPopoverClose()
    } catch (err) {
      console.error("Failed to delete connection:", err)
      toastError("Failed to delete connection")
    }
  }, [
    selectedConnection,
    client,
    toastSuccess,
    toastError,
    handleConnectionPopoverClose,
  ])

  // CRUD handlers for locations
  const handleAddLocation = () => {
    setEditingLocation(null)
    setFormDialogOpen(true)
  }

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setFormDialogOpen(true)
  }

  const handleDeleteLocation = (location: Location) => {
    setDeletingLocation(location)
    setDeleteDialogOpen(true)
  }

  const handleSaveLocation = async (locationData: Partial<Location>) => {
    if (!fightId) return

    try {
      if (editingLocation?.id) {
        // Update existing location
        await client.updateLocation(editingLocation.id, locationData)
        toastSuccess(`Location "${locationData.name}" updated`)
      } else {
        // Create new location - calculate position to avoid overlap
        const newPosition = calculateNewLocationPosition()
        const newLocation = {
          ...locationData,
          position_x: newPosition.x,
          position_y: newPosition.y,
          width: DEFAULT_ZONE_WIDTH,
          height: DEFAULT_ZONE_HEIGHT,
        }
        await client.createFightLocation(fightId, newLocation)
        toastSuccess(`Location "${locationData.name}" created`)
      }
      // WebSocket will broadcast the update automatically
    } catch (err) {
      console.error("Failed to save location:", err)
      toastError("Failed to save location")
      throw err // Re-throw so dialog knows it failed
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingLocation?.id) return

    try {
      await client.deleteLocation(deletingLocation.id)
      toastSuccess(`Location "${deletingLocation.name}" deleted`)
      setDeleteDialogOpen(false)
      setDeletingLocation(null)
      // WebSocket will broadcast the update automatically
    } catch (err) {
      console.error("Failed to delete location:", err)
      toastError("Failed to delete location")
    }
  }

  // Calculate position for new location to avoid overlap
  const calculateNewLocationPosition = (): { x: number; y: number } => {
    const padding = ZONE_SPACING
    const x = padding
    const y = padding

    // Find a position that doesn't overlap with existing locations
    const existingRects = displayData.locations.map(loc => ({
      x: loc.position_x ?? 0,
      y: loc.position_y ?? 0,
      width: loc.width ?? DEFAULT_ZONE_WIDTH,
      height: loc.height ?? DEFAULT_ZONE_HEIGHT,
    }))

    // Try positions in a grid pattern
    const gridStep = DEFAULT_ZONE_WIDTH + padding
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 5; col++) {
        const testX = col * gridStep + padding
        const testY = row * (DEFAULT_ZONE_HEIGHT + padding) + padding
        const testRect = {
          x: testX,
          y: testY,
          width: DEFAULT_ZONE_WIDTH,
          height: DEFAULT_ZONE_HEIGHT,
        }

        const hasOverlap = existingRects.some(rect =>
          rectsOverlap(testRect, rect, COLLISION_PADDING)
        )

        if (!hasOverlap) {
          return { x: testX, y: testY }
        }
      }
    }

    // Fallback: place at bottom
    const maxY = Math.max(0, ...existingRects.map(r => r.y + r.height))
    return { x: padding, y: maxY + padding }
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
      {/* Header controls */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          gap: 1,
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddLocation}
        >
          Add Location
        </Button>
        {viewMode === "canvas" && (
          <Tooltip
            title={
              connectionMode ? "Exit connection mode" : "Connect locations"
            }
          >
            <ToggleButton
              value="connect"
              selected={connectionMode}
              onChange={toggleConnectionMode}
              size="small"
              sx={{
                borderColor: connectionMode ? "primary.main" : undefined,
                backgroundColor: connectionMode ? "primary.light" : undefined,
                "&:hover": {
                  backgroundColor: connectionMode ? "primary.light" : undefined,
                },
              }}
            >
              <ConnectIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        )}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="grid">
            <Tooltip title="Grid View">
              <GridIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="canvas">
            <Tooltip title="Canvas View (drag to reposition)">
              <CanvasIcon fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

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
          {viewMode === "grid" ? (
            // Grid layout (original Phase 2 behavior)
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
                  onEdit={handleEditLocation}
                  onDelete={handleDeleteLocation}
                  isCanvasMode={false}
                />
              ))}
            </Box>
          ) : (
            // Canvas layout (Phase 3 - draggable/resizable zones)
            <Box
              ref={canvasRef}
              onMouseMove={handleCanvasMouseMove}
              onClick={() => {
                // Cancel pending connection when clicking on empty canvas
                if (connectionMode && pendingConnection) {
                  setPendingConnection(null)
                  setPreviewLine(null)
                }
              }}
              sx={{
                position: "relative",
                minWidth: canvasDimensions.width,
                minHeight: canvasDimensions.height,
                backgroundColor: "grey.100",
                borderRadius: 1,
                border: "1px solid",
                borderColor: connectionMode ? "primary.main" : "divider",
                borderWidth: connectionMode ? 2 : 1,
                overflow: "auto",
                cursor: connectionMode ? "crosshair" : "default",
              }}
            >
              {/* Connection lines layer */}
              <ConnectionsLayer
                connections={connections}
                locations={displayData.locations}
                selectedConnection={selectedConnection}
                onConnectionClick={handleConnectionClick}
                previewLine={previewLine}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
              />

              {displayData.locations.map(location => (
                <LocationZone
                  key={location.id}
                  location={location}
                  onCharacterClick={handleCharacterClick}
                  onPositionChange={handlePositionChange}
                  onSizeChange={handleSizeChange}
                  onDragEnd={handleZoneDragEnd}
                  onResizeEnd={handleZoneDragEnd}
                  onEdit={handleEditLocation}
                  onDelete={handleDeleteLocation}
                  isCanvasMode={true}
                />
              ))}

              {/* Connection handles (visible only in connection mode) */}
              {connectionMode &&
                handlePositions.map(({ locationId, centerX, centerY }) => (
                  <ConnectionHandle
                    key={`handle-${locationId}`}
                    x={centerX}
                    y={centerY}
                    isActive={pendingConnection === locationId}
                    onClick={() => handleConnectionHandleClick(locationId)}
                  />
                ))}
            </Box>
          )}

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

      {/* Location form dialog for add/edit */}
      <LocationFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false)
          setEditingLocation(null)
        }}
        onSave={handleSaveLocation}
        location={editingLocation}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeletingLocation(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Location"
        message={`Are you sure you want to delete "${deletingLocation?.name}"? Characters in this location will be moved to Unassigned.`}
        destructive
      />

      {/* Connection popover for creating/editing connections */}
      <ConnectionPopover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handleConnectionPopoverClose}
        onSave={handleConnectionSave}
        onDelete={!isNewConnection ? handleConnectionDelete : undefined}
        connection={selectedConnection}
        isNewConnection={isNewConnection}
      />
    </BasePanel>
  )
}
