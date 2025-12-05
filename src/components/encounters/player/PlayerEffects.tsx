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
          p: 1.5,
          background: "linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)",
          borderRadius: 2,
          border: "1px solid rgba(255, 255, 255, 0.06)",
          display: "flex",
          flexWrap: "wrap",
          gap: 0.75,
          alignItems: "center",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
        }}
      >
        <CharacterEffectsDisplay character={character} effects={effects} />
      </Box>
    </Box>
  )
}
