import { Box } from "@mui/material"
import type { Character } from "@/types"
import { Actions, ActionValues } from "@/components/encounters"
import CharacterEffectsDisplay from "./effects/CharacterEffectsDisplay"

interface CharacterProps {
  character: Character
}

export default function Character({ character }: CharacterProps) {
  return (
    <Box component="span" sx={{ display: "flex", gap: 1 }}>
      <Box
        component="span"
        sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1 }}
      >
        <ActionValues character={character} />
        <CharacterEffectsDisplay character={character} effects={character.effects || []} />
      </Box>
      <Actions entity={character} />
    </Box>
  )
}
