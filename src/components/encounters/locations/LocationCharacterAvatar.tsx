"use client"

import { Box, Avatar, Typography, Badge, Tooltip } from "@mui/material"
import { useDraggable } from "@dnd-kit/core"
import type { LocationShot } from "@/types"

interface LocationCharacterAvatarProps {
  shot: LocationShot
  onClick?: (shot: LocationShot) => void
  isDragOverlay?: boolean
}

/**
 * Compact avatar display for characters/vehicles in location zones.
 * Shows image, name, faction color, and mook count badge.
 * Draggable using @dnd-kit for moving between locations.
 */
export default function LocationCharacterAvatar({
  shot,
  onClick,
  isDragOverlay = false,
}: LocationCharacterAvatarProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: shot.id,
    disabled: isDragOverlay,
  })

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
        cursor: isDragOverlay ? "grabbing" : "grab",
        transition: "background-color 0.2s, opacity 0.2s",
        "&:hover": {
          backgroundColor: "action.hover",
        },
        minWidth: 60,
        maxWidth: 80,
        opacity: isDragging && !isDragOverlay ? 0.5 : 1,
        userSelect: "none",
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
          userSelect: "none",
        }}
      >
        {name}
      </Typography>
    </Box>
  )

  // For drag overlay, don't add drag handlers
  if (isDragOverlay) {
    return (
      <Tooltip title={name} placement="top" arrow>
        {avatarContent}
      </Tooltip>
    )
  }

  // Wrap with draggable div - ref and listeners must be on outermost element
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ touchAction: "none" }}
    >
      <Tooltip title={name} placement="top" arrow>
        {avatarContent}
      </Tooltip>
    </div>
  )
}
