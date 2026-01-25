"use client"

import { Paper, Box, Typography } from "@mui/material"
import type { Location, LocationShot } from "@/types"
import LocationCharacterAvatar from "./LocationCharacterAvatar"

interface LocationZoneProps {
  location: Location
  onCharacterClick?: (shot: LocationShot) => void
}

/**
 * Visual zone representing a location in the fight.
 * Displays location name and contains character avatars.
 *
 * For Phase 1, this is read-only (no drag/resize).
 * Uses CSS Grid layout from parent for positioning.
 */
export default function LocationZone({
  location,
  onCharacterClick,
}: LocationZoneProps) {
  const shots = location.shots || []
  const hasCharacters = shots.length > 0

  return (
    <Paper
      elevation={3}
      sx={{
        minHeight: 120,
        backgroundColor: location.color || "background.paper",
        border: "2px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          px: 1.5,
          py: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: "bold",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {location.name}
        </Typography>
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
          minHeight: 60,
        }}
      >
        {hasCharacters ? (
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
            Empty
          </Typography>
        )}
      </Box>
    </Paper>
  )
}
