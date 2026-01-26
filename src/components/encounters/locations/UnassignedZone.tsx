"use client"

import { Paper, Box, Typography } from "@mui/material"
import { useDroppable } from "@dnd-kit/core"
import type { LocationShot } from "@/types"
import LocationCharacterAvatar from "./LocationCharacterAvatar"

interface UnassignedZoneProps {
  shots: LocationShot[]
  onCharacterClick?: (shot: LocationShot) => void
}

/**
 * Special zone that displays characters/vehicles without a location.
 * Always visible at the bottom of the locations panel as a drop target.
 * Droppable zone for removing characters from locations.
 */
export default function UnassignedZone({
  shots,
  onCharacterClick,
}: UnassignedZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "unassigned",
  })

  return (
    <Paper
      ref={setNodeRef}
      elevation={isOver ? 3 : 1}
      sx={{
        mt: 2,
        border: "2px dashed",
        borderColor: isOver ? "primary.main" : "warning.main",
        borderRadius: 2,
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "warning.light",
          color: "warning.contrastText",
          px: 1.5,
          py: 0.75,
          borderBottom: "1px dashed",
          borderColor: "warning.main",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Unassigned ({shots.length})
        </Typography>
      </Box>

      {/* Characters */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          backgroundColor: "background.default",
          minHeight: 60,
        }}
      >
        {shots.length > 0 ? (
          shots.map(shot => (
            <LocationCharacterAvatar
              key={shot.id}
              shot={shot}
              onClick={onCharacterClick}
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
            Drop here to remove from location
          </Typography>
        )}
      </Box>
    </Paper>
  )
}
