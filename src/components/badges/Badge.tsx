"use client"

import { Avatar, Typography, Stack } from "@mui/material"
import type { BadgeProps, Entity } from "@/types"
import { useCampaign } from "@/contexts"
import { useState, useEffect } from "react"

const sizes = {
  sm: {
    avatar: 45,
    titleFont: "0.75rem",
    subtitleFont: "0.5rem",
  },
  md: {
    avatar: 60,
    titleFont: "1rem",
    subtitleFont: "0.75rem",
  },
  lg: {
    avatar: 75,
    titleFont: "1.5rem",
    subtitleFont: "0.875rem",
  },
}

export default function Badge({
  name,
  entity: initialEntity,
  size = "md",
  title,
  children,
  disableAvatar = false,
  onClick,
  sx = {},
}: BadgeProps) {
  const { campaignData } = useCampaign()
  const [entity, setEntity] = useState<Entity>(initialEntity)
  const { avatar, titleFont, subtitleFont } = sizes[size]
  const initials = entity.name
    ? (() => {
        // Remove parentheses and their contents before splitting
        const cleanedName = entity.name.replace(/\s*\([^)]*\)/g, "").trim()
        const words = cleanedName.split(/\s+/)
        if (words.length === 0) return ""
        if (words.length === 1) return words[0].charAt(0).toUpperCase()

        const firstLetter = words[0].charAt(0).toUpperCase()
        const lastLetter = words[words.length - 1].charAt(0).toUpperCase()
        return firstLetter + lastLetter
      })()
    : ""

  useEffect(() => {
    if (!campaignData) return
    if (!name) return

    if (campaignData[name] && campaignData[name].id === entity.id) {
      setEntity(campaignData[name])
    }
  }, [name, campaignData, entity.id])

  return (
    <Stack
      direction="row"
      spacing={1}
      onClick={onClick}
      sx={{
        flexShrink: 0,
        backgroundColor: "#1d1d1d",
        borderRadius: "1rem",
        overflow: "hidden",
        height: avatar, // Explicit height to match avatar size
        alignItems: "center",
        paddingRight: "0.5rem",
        paddingLeft: disableAvatar ? "1rem" : undefined,
        maxWidth: "100%",
        ...sx,
      }}
    >
      {!disableAvatar && entity.image_url && (
        <div
          key={entity.image_url}
          style={{
            width: avatar,
            minWidth: avatar,
            height: avatar, // Explicit height to match width
            backgroundImage: `url("${entity.image_url}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "1rem 0 0 1rem",
            flexShrink: 0,
          }}
          aria-label={entity.name}
        />
      )}
      {!disableAvatar && !entity.image_url && (
        <div
          style={{
            width: avatar,
            minWidth: avatar,
            height: avatar, // Explicit height to match width
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "1rem 0 0 1rem",
            flexShrink: 0,
          }}
          aria-label={entity.name}
        >
          <Avatar
            alt={entity.name}
            src={entity.image_url || ""}
            sx={{
              width: avatar * 0.75,
              height: avatar * 0.75,
              mt: 0.75,
              ml: 0.75,
              bgcolor: "primary.main",
            }}
          >
            {initials}
          </Avatar>
        </div>
      )}
      <Stack direction="column" sx={{ justifyContent: "center" }}>
        <Typography variant="h6" sx={{ fontSize: titleFont }}>
          {title}
        </Typography>
        <Typography
          component="div"
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: subtitleFont }}
        >
          {children}
        </Typography>
      </Stack>
    </Stack>
  )
}
