"use client"

import { Box, Avatar, Typography, Badge, Tooltip } from "@mui/material"
import type { LocationShot } from "@/types"

interface LocationCharacterAvatarProps {
  shot: LocationShot
  onClick?: (shot: LocationShot) => void
}

/**
 * Compact avatar display for characters/vehicles in location zones.
 * Shows image, name, faction color, and mook count badge.
 */
export default function LocationCharacterAvatar({
  shot,
  onClick,
}: LocationCharacterAvatarProps) {
  const character = shot.character
  const vehicle = shot.vehicle

  const name = character?.name || vehicle?.name || "Unknown"
  const imageUrl = character?.image_url || vehicle?.image_url
  const isMook = character?.character_type === "mook"
  const count = character?.count || shot.count || 1

  // Faction-based color (simplified for now)
  const getFactionColor = () => {
    const faction = character?.faction?.toLowerCase()
    if (!faction) return "#666"
    if (faction.includes("dragon")) return "#2196f3"
    if (faction.includes("ascended")) return "#4caf50"
    if (faction.includes("lotus")) return "#9c27b0"
    if (faction.includes("architect")) return "#f44336"
    if (faction.includes("jammer")) return "#ff9800"
    return "#666"
  }

  const handleClick = () => {
    if (onClick) {
      onClick(shot)
    }
  }

  const avatarContent = (
    <Box
      onClick={handleClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        p: 0.5,
        borderRadius: 1,
        cursor: onClick ? "pointer" : "default",
        transition: "background-color 0.2s",
        "&:hover": onClick
          ? {
              backgroundColor: "action.hover",
            }
          : {},
        minWidth: 60,
        maxWidth: 80,
      }}
    >
      <Badge
        badgeContent={isMook && count > 1 ? `x${count}` : null}
        color="error"
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Avatar
          src={imageUrl || undefined}
          alt={name}
          sx={{
            width: 40,
            height: 40,
            border: 2,
            borderColor: getFactionColor(),
            backgroundColor: "background.default",
          }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
      </Badge>
      <Typography
        variant="caption"
        sx={{
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          fontSize: "0.65rem",
          lineHeight: 1.2,
        }}
      >
        {name}
      </Typography>
    </Box>
  )

  return (
    <Tooltip title={name} placement="top" arrow>
      {avatarContent}
    </Tooltip>
  )
}
