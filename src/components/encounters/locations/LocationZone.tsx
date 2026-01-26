"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Paper, Box, Typography, IconButton } from "@mui/material"
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material"
import { useDroppable } from "@dnd-kit/core"
import type { Location, LocationShot } from "@/types"
import LocationCharacterAvatar from "./LocationCharacterAvatar"
import { MIN_ZONE_WIDTH, MIN_ZONE_HEIGHT } from "./constants"

interface LocationZoneProps {
  location: Location
  onCharacterClick?: (shot: LocationShot) => void
  onCharacterSelect?: (shotId: string, addToSelection: boolean) => void
  selectedShotIds?: Set<string>
  onPositionChange?: (
    location: Location,
    position: { x: number; y: number }
  ) => void
  onSizeChange?: (
    location: Location,
    size: { width: number; height: number }
  ) => void
  onDragEnd?: (location: Location) => void
  onResizeEnd?: (location: Location) => void
  onEdit?: (location: Location) => void
  onDelete?: (location: Location) => void
  isCanvasMode?: boolean
}

/**
 * Visual zone representing a location in the fight.
 * Displays location name and contains character avatars.
 * Droppable zone for drag-and-drop character movement.
 * Supports dragging (by header) and resizing (by handles) when in canvas mode.
 */
export default function LocationZone({
  location,
  onCharacterClick,
  onCharacterSelect,
  selectedShotIds,
  onPositionChange,
  onSizeChange,
  onDragEnd,
  onResizeEnd,
  onEdit,
  onDelete,
  isCanvasMode = false,
}: LocationZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: location.id,
  })

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const dragStartPos = useRef<{
    x: number
    y: number
    locX: number
    locY: number
  } | null>(null)
  const resizeStartPos = useRef<{
    x: number
    y: number
    width: number
    height: number
    locX: number
    locY: number
    handle: string
  } | null>(null)

  // Store cleanup functions for event listeners
  const cleanupRef = useRef<(() => void) | null>(null)

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [])

  const shots = location.shots || []
  const hasCharacters = shots.length > 0

  // Header drag handlers
  const handleHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isCanvasMode || !onPositionChange) return
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      dragStartPos.current = {
        x: e.clientX,
        y: e.clientY,
        locX: location.position_x ?? 0,
        locY: location.position_y ?? 0,
      }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragStartPos.current) return
        const deltaX = moveEvent.clientX - dragStartPos.current.x
        const deltaY = moveEvent.clientY - dragStartPos.current.y
        const newX = Math.max(0, dragStartPos.current.locX + deltaX)
        const newY = Math.max(0, dragStartPos.current.locY + deltaY)
        onPositionChange(location, { x: newX, y: newY })
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        dragStartPos.current = null
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        cleanupRef.current = null
        onDragEnd?.(location)
      }

      // Store cleanup function for unmount
      cleanupRef.current = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [isCanvasMode, location, onPositionChange, onDragEnd]
  )

  // Resize handle mouse down
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: string) => {
      if (!isCanvasMode || !onSizeChange) return
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      resizeStartPos.current = {
        x: e.clientX,
        y: e.clientY,
        width: location.width ?? 200,
        height: location.height ?? 150,
        locX: location.position_x ?? 0,
        locY: location.position_y ?? 0,
        handle,
      }

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeStartPos.current) return
        const deltaX = moveEvent.clientX - resizeStartPos.current.x
        const deltaY = moveEvent.clientY - resizeStartPos.current.y
        const {
          handle: h,
          width: startW,
          height: startH,
          locX,
          locY,
        } = resizeStartPos.current

        let newWidth = startW
        let newHeight = startH
        let newX = locX
        let newY = locY

        // Handle resize based on which handle is being dragged
        if (h.includes("e")) {
          newWidth = Math.max(MIN_ZONE_WIDTH, startW + deltaX)
        }
        if (h.includes("w")) {
          const widthDelta = Math.min(deltaX, startW - MIN_ZONE_WIDTH)
          newWidth = startW - widthDelta
          newX = locX + widthDelta
        }
        if (h.includes("s")) {
          newHeight = Math.max(MIN_ZONE_HEIGHT, startH + deltaY)
        }
        if (h.includes("n")) {
          const heightDelta = Math.min(deltaY, startH - MIN_ZONE_HEIGHT)
          newHeight = startH - heightDelta
          newY = locY + heightDelta
        }

        onSizeChange(location, { width: newWidth, height: newHeight })
        if (h.includes("w") || h.includes("n")) {
          onPositionChange?.(location, { x: newX, y: newY })
        }
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        resizeStartPos.current = null
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        cleanupRef.current = null
        onResizeEnd?.(location)
      }

      // Store cleanup function for unmount
      cleanupRef.current = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [isCanvasMode, location, onSizeChange, onPositionChange, onResizeEnd]
  )

  // Resize handle component
  const ResizeHandle = ({
    position,
    cursor,
  }: {
    position: string
    cursor: string
  }) => {
    const positionStyles: Record<string, React.CSSProperties> = {
      n: {
        top: -4,
        left: "50%",
        transform: "translateX(-50%)",
        width: 30,
        height: 8,
      },
      s: {
        bottom: -4,
        left: "50%",
        transform: "translateX(-50%)",
        width: 30,
        height: 8,
      },
      e: {
        right: -4,
        top: "50%",
        transform: "translateY(-50%)",
        width: 8,
        height: 30,
      },
      w: {
        left: -4,
        top: "50%",
        transform: "translateY(-50%)",
        width: 8,
        height: 30,
      },
      ne: { top: -4, right: -4, width: 12, height: 12 },
      nw: { top: -4, left: -4, width: 12, height: 12 },
      se: { bottom: -4, right: -4, width: 12, height: 12 },
      sw: { bottom: -4, left: -4, width: 12, height: 12 },
    }

    return (
      <Box
        onMouseDown={e => handleResizeMouseDown(e, position)}
        sx={{
          position: "absolute",
          ...positionStyles[position],
          cursor,
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "primary.main",
            opacity: 0.5,
          },
          borderRadius: position.length === 2 ? "50%" : 1,
          zIndex: 10,
        }}
      />
    )
  }

  const zoneStyles: React.CSSProperties = isCanvasMode
    ? {
        position: "absolute",
        left: location.position_x ?? 0,
        top: location.position_y ?? 0,
        width: location.width ?? 200,
        height: location.height ?? 150,
      }
    : {}

  return (
    <Paper
      ref={setNodeRef}
      elevation={isOver ? 6 : isDragging || isResizing ? 8 : 3}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      sx={{
        ...zoneStyles,
        minHeight: isCanvasMode ? undefined : 120,
        backgroundColor: location.color || "background.paper",
        border: "2px solid",
        borderColor: isOver
          ? "primary.main"
          : isDragging || isResizing
            ? "info.main"
            : "divider",
        borderRadius: 2,
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        transition:
          isDragging || isResizing
            ? "none"
            : "border-color 0.2s, box-shadow 0.2s",
        userSelect: isDragging || isResizing ? "none" : "auto",
      }}
    >
      {/* Header - draggable in canvas mode, double-click to edit */}
      <Box
        onMouseDown={handleHeaderMouseDown}
        onDoubleClick={() => onEdit?.(location)}
        sx={{
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          px: 1.5,
          py: 0.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          cursor: isCanvasMode ? "move" : "default",
          borderTopLeftRadius: "inherit",
          borderTopRightRadius: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 32,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {location.name}
        </Typography>

        {/* Action buttons - show on hover */}
        {isHovering && (onEdit || onDelete) && (
          <Box sx={{ display: "flex", ml: 0.5 }}>
            {onEdit && (
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation()
                  onEdit(location)
                }}
                sx={{
                  color: "primary.contrastText",
                  p: 0.25,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation()
                  onDelete(location)
                }}
                sx={{
                  color: "primary.contrastText",
                  p: 0.25,
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Characters */}
      <Box
        sx={{
          flex: 1,
          p: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          alignContent: "flex-start",
          minHeight: isCanvasMode ? undefined : 60,
          overflow: "auto",
        }}
      >
        {hasCharacters ? (
          shots.map(shot => (
            <LocationCharacterAvatar
              key={shot.id}
              shot={shot}
              onClick={onCharacterClick}
              onSelect={onCharacterSelect}
              isSelected={selectedShotIds?.has(shot.id) ?? false}
            />
          ))
        ) : (
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
              alignSelf: "center",
              width: "100%",
              textAlign: "center",
            }}
          >
            Empty
          </Typography>
        )}
      </Box>

      {/* Resize handles - only in canvas mode */}
      {isCanvasMode && (
        <>
          <ResizeHandle position="n" cursor="ns-resize" />
          <ResizeHandle position="s" cursor="ns-resize" />
          <ResizeHandle position="e" cursor="ew-resize" />
          <ResizeHandle position="w" cursor="ew-resize" />
          <ResizeHandle position="ne" cursor="nesw-resize" />
          <ResizeHandle position="nw" cursor="nwse-resize" />
          <ResizeHandle position="se" cursor="nwse-resize" />
          <ResizeHandle position="sw" cursor="nesw-resize" />
        </>
      )}
    </Paper>
  )
}
