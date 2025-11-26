"use client"

import { Box } from "@mui/material"
import type { Character, CharacterEffect } from "@/types"
import CharacterEffectsDisplay from "../effects/CharacterEffectsDisplay"

interface PlayerEffectsProps {
  character: Character
  effects?: CharacterEffect[]
}

export default function PlayerEffects({
  character,
  effects = [],
}: PlayerEffectsProps) {
  return (
    <Box sx={{ p: 1, mb: 0.5 }}>
      <Box
        sx={{
          p: 1,
          backgroundColor: "background.paper",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          alignItems: "center",
        }}
      >
        <CharacterEffectsDisplay character={character} effects={effects} />
      </Box>
    </Box>
  )
}
