"use client"

import { Box, Typography } from "@mui/material"
import { HeroTitle, Carousel } from "@/components/ui"
import { SpeedDial } from "@/components/characters"

export default function CreatePage() {
  const items = [
    { id: 1, content: "First Item" },
    { id: 2, content: "Second Item" },
    { id: 3, content: "Third Item" },
  ]
  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, position: "relative" }}>
      <SpeedDial />
      <HeroTitle>Create</HeroTitle>
      <Typography variant="body1" sx={{ mt: 2 }}>
        This page is under construction. Please check back later for updates.
      </Typography>
      <Carousel items={items} />
    </Box>
  )
}
