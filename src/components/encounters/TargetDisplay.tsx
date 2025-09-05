"use client"

import React from "react"
import { Box } from "@mui/material"
import { CharacterHeader, Wounds, ActionValues } from "@/components/encounters"
import type { Character } from "@/types"

interface TargetDisplayProps {
  character: Character
}

export default function TargetDisplay({ character }: TargetDisplayProps) {
  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "background.paper",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          minWidth: { xs: 40, sm: 56 },
          mr: { xs: 1, sm: 2 },
        }}
      >
        <Wounds character={character} />
      </Box>
      <Box sx={{ flex: 1 }}>
        <CharacterHeader character={character} />
        <ActionValues character={character} />
      </Box>
    </Box>
  )
}
