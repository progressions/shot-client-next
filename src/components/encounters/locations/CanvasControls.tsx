"use client"

import { Box, IconButton, Tooltip, Typography } from "@mui/material"
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as ResetIcon,
} from "@mui/icons-material"

interface CanvasControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  minZoom?: number
  maxZoom?: number
}

/**
 * Floating controls for canvas zoom and pan reset.
 * Displayed in the bottom-left corner of the canvas.
 */
export default function CanvasControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  minZoom = 0.5,
  maxZoom = 2,
}: CanvasControlsProps) {
  const zoomPercent = Math.round(zoom * 100)

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 8,
        left: 8,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 1,
        padding: "2px 8px",
        zIndex: 10,
      }}
    >
      <Tooltip title="Zoom out (-)">
        <span>
          <IconButton
            size="small"
            onClick={onZoomOut}
            disabled={zoom <= minZoom}
            sx={{ color: "white" }}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Typography
        variant="caption"
        sx={{
          color: "white",
          minWidth: 40,
          textAlign: "center",
          userSelect: "none",
        }}
      >
        {zoomPercent}%
      </Typography>
      <Tooltip title="Zoom in (+)">
        <span>
          <IconButton
            size="small"
            onClick={onZoomIn}
            disabled={zoom >= maxZoom}
            sx={{ color: "white" }}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Reset view (0)">
        <IconButton size="small" onClick={onReset} sx={{ color: "white" }}>
          <ResetIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
