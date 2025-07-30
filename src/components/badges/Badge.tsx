"use client"

import { Avatar, Typography, Stack } from "@mui/material"
import type { Entity } from "@/types"
import type { SystemStyleObject, Theme } from "@mui/system"

type BadgeProperties = {
  entity: Entity
  size?: "sm" | "md" | "lg"
  title: React.ReactNode
  children: React.ReactNode
  sx?: SystemStyleObject<Theme>
}

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
  entity,
  size = "md",
  title,
  children,
  sx = {},
}: BadgeProperties) {
  const { avatar, titleFont, subtitleFont } = sizes[size]
  const initials = entity.name
    ? entity.name
        .split(" ")
        .map((part: string) => part.charAt(0).toUpperCase())
        .join("")
    : ""

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        flexShrink: 0,
        backgroundColor: "#1d1d1d",
        borderRadius: "1rem",
        overflow: "hidden",
        height: avatar, // Explicit height to match avatar size
        alignItems: "center",
        paddingRight: "0.5rem",
        maxWidth: "100%",
        ...sx,
      }}
    >
      {entity.image_url && (
        <div
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
      {!entity.image_url && (
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
