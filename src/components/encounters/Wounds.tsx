"use client"

import { Box, Stack } from "@mui/material"
import type { Character } from "@/types"
import { CS } from "@/services"
import { useTheme } from "@mui/material/styles"

interface WoundsProps {
  character: Character
}

export default function Wounds({ character }: WoundsProps) {
  const theme = useTheme()
  const wounds = CS.wounds(character)

  return (
    <Stack
      direction="column"
      sx={{
        backgroundColor: theme.palette.divider,
        width: { xs: "3.5rem", md: "4.5rem" },
        textAlign: "center",
        py: 1,
        borderRadius: "8px",
        alignItems: "center",
      }}
    >
      <Box sx={{ fontSize: { xs: "1.5rem", md: "1.75rem" }, fontWeight: 800 }}>
        {wounds}
      </Box>
      <Box sx={{ fontSize: { xs: "0.75rem", md: "0.75rem" } }}>Wounds</Box>
    </Stack>
  )
}
