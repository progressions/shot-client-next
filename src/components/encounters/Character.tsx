import { Stack } from "@mui/material"
import type { Character } from "@/types"
import { Actions, ActionValues } from "@/components/encounters"

interface CharacterProps {
  character: Character
}

export default function Character({ character }: CharacterProps) {
  return (
    <Stack component="span" direction="row" spacing={1}>
      <Stack
        component="span"
        direction="column"
        spacing={1}
        sx={{ flexGrow: 1 }}
      >
        <ActionValues character={character} />
      </Stack>
      <Actions entity={character} />
    </Stack>
  )
}
