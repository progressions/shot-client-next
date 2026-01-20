"use client"

import { Box, Typography, Fade } from "@mui/material"
import { useHotkeys } from "@/contexts"

/**
 * Visual indicator shown when in command mode (after pressing G or N)
 * Displays in bottom-right corner of screen
 */
export function CommandModeIndicator() {
  const { commandMode } = useHotkeys()

  const modeLabels: Record<string, string> = {
    g: "Go to...",
    n: "New...",
  }

  return (
    <Fade in={commandMode !== null} timeout={150}>
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          bgcolor: "rgba(0, 0, 0, 0.85)",
          color: "#fff",
          px: 2.5,
          py: 1.5,
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          component="kbd"
          sx={{
            bgcolor: "#3b82f6",
            color: "#fff",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "1rem",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          {commandMode}
        </Box>
        <Typography variant="body2" sx={{ color: "#ccc" }}>
          {commandMode && modeLabels[commandMode]}
        </Typography>
      </Box>
    </Fade>
  )
}
