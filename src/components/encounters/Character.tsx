import { Box, Typography } from "@mui/material"
import type { Character } from "@/types"
import { CS } from "@/services"
import { ActionValues } from "@/components/encounters"

interface CharacterProps {
  character: Character
}

export default function Character({ character }: CharacterProps) {
  return (
    <Box component="span">
      <ActionValues character={character} />
    </Box>
  )
}
