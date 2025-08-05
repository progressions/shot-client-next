import { Stack, Box, Typography } from "@mui/material"
import type { Character } from "@/types"
import { CS } from "@/services"
import { ActionValues } from "@/components/encounters"

interface CharacterProps {
  character: Character
}

export default function Character({ character }: CharacterProps) {
  return (
    <Stack component="span" direction="column" spacing={1}>
      <Typography variant="caption" sx={{textTransform: "lowercase", fontVariant: "small-caps"}}>{CS.archetype(character)} {CS.faction(character)?.name && <>{" - "}{CS.faction(character)?.name}</>}</Typography>
      <ActionValues character={character} />
    </Stack>
  )
}
