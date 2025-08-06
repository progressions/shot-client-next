import { Stack } from "@mui/material"
import type { Shot, Character } from "@/types"
import { Actions, ActionValues } from "@/components/encounters"
import { useEncounter } from "@/contexts"

interface CharacterProps {
  shot: Shot
  character: Character
}

export default function Character({ shot, character }: CharacterProps) {
  const { encounterState } = useEncounter()

  const handleClick = () => {}

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
      <Actions character={character} />
    </Stack>
  )
}
