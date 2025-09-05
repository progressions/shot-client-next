"use client"

import React from "react"
import { IconButton, IconButtonProps } from "@mui/material"

interface MenuButtonProps extends Omit<IconButtonProps, "sx"> {
  isActive?: boolean
  children: React.ReactNode
}

export default function MenuButton({
  isActive = false,
  children,
  ...props
}: MenuButtonProps) {
  const sx = {
    px: { xs: 0.5, sm: 1 },
    backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
    borderRadius: 1,
    color: "white",
    "&:hover": {
      backgroundColor: isActive
        ? "rgba(255, 255, 255, 0.3)"
        : "rgba(255, 255, 255, 0.1)",
    },
    "&:disabled": {
      backgroundColor: "transparent",
    },
  }

  return (
    <IconButton sx={sx} {...props}>
      {children}
    </IconButton>
  )
}
