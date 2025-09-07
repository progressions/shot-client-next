"use client"

import React from "react"
import { Paper, Box, Typography, type SxProps, type Theme } from "@mui/material"

interface BasePanelProps {
  title: string
  icon?: React.ReactNode
  borderColor?: string
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export default function BasePanel({
  title,
  icon,
  borderColor = "primary.main",
  children,
  sx,
}: BasePanelProps) {
  return (
    <Paper
      sx={{
        p: 3,
        mb: 2,
        position: "relative",
        border: "2px solid",
        borderColor,
        backgroundColor: "background.paper",
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        {icon && React.cloneElement(icon as React.ReactElement, { size: 24 })}
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  )
}
