"use client"

import { Box } from "@mui/material"
import type { Character } from "@/types"
import { CS } from "@/services"
import { useTheme } from "@mui/material/styles"

interface WoundsProps {
  character: Character
}

export default function Wounds({ character }: WoundsProps) {
  const theme = useTheme()
  const wounds = CS.wounds(character)
  const isMook = CS.isMook(character)

  // Determine if wounds exceed threshold
  const isBossType = CS.isBoss(character) || CS.isUberBoss(character)
  const threshold = isBossType ? 50 : 35
  const exceedsThreshold = wounds >= threshold

  return (
    <Box
      sx={{
        backgroundColor: exceedsThreshold
          ? theme.palette.error.dark
          : theme.palette.custom?.grey?.main || "#424242",
        width: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
        height: { xs: "2.5rem", sm: "3rem", md: "auto" },
        borderRadius: { xs: "50%", sm: "50%", md: "8px" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: { xs: 0, md: 1 },
        px: { xs: 0, md: 0.5 },
      }}
    >
      <Box
        sx={{
          fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
          fontWeight: 800,
          lineHeight: 1,
          color: exceedsThreshold
            ? theme.palette.error.contrastText
            : "inherit",
        }}
      >
        {wounds}
      </Box>
      <Box
        sx={{
          fontSize: { xs: "0.5rem", sm: "0.6rem", md: "0.75rem" },
          display: { xs: "none", sm: "none", md: "block" },
          color: exceedsThreshold
            ? theme.palette.error.contrastText
            : "inherit",
        }}
      >
        {isMook ? "Mooks" : "Wounds"}
      </Box>
    </Box>
  )
}
