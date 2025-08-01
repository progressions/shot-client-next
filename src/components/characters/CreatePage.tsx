"use client"

import { Box, Typography } from "@mui/material"
import { HeroTitle } from "@/components/ui"
import { SpeedDial } from "@/components/characters"

export default function CreatePage() {
  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, position: "relative" }}>
      <SpeedDial />
      <HeroTitle>Create</HeroTitle>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This page is under construction. Please check back later for updates.
      </Typography>
    </Box>
  )
}
