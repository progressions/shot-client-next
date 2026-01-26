"use client"

import { useState } from "react"
import { Box } from "@mui/material"
import {
  CONNECTION_HANDLE_SIZE,
  CONNECTION_HANDLE_COLOR,
  CONNECTION_HANDLE_HOVER_COLOR,
} from "./constants"

interface ConnectionHandleProps {
  /** X position (center of zone) */
  x: number
  /** Y position (center of zone) */
  y: number
  /** Whether this handle is the active/selected start of a connection */
  isActive?: boolean
  /** Click handler */
  onClick: () => void
}

/**
 * ConnectionHandle is a circular anchor point at the center of a zone.
 * Visible only in connection mode. Click to start/complete connection creation.
 */
export default function ConnectionHandle({
  x,
  y,
  isActive = false,
  onClick,
}: ConnectionHandleProps) {
  const [isHovered, setIsHovered] = useState(false)

  const size = CONNECTION_HANDLE_SIZE
  const color =
    isHovered || isActive
      ? CONNECTION_HANDLE_HOVER_COLOR
      : CONNECTION_HANDLE_COLOR

  return (
    <Box
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: isActive ? color : "white",
        border: `2px solid ${color}`,
        cursor: "pointer",
        transition: "all 0.15s ease",
        transform: isHovered || isActive ? "scale(1.2)" : "scale(1)",
        boxShadow:
          isHovered || isActive
            ? `0 0 0 4px ${color}33`
            : "0 1px 3px rgba(0,0,0,0.2)",
        zIndex: 1000,
        "&:hover": {
          backgroundColor: color,
        },
      }}
    />
  )
}
