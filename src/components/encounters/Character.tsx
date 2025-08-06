import { IconButton, Stack, Box, Typography } from "@mui/material"
import type { Character } from "@/types"
import { CS } from "@/services"
import { ActionValues } from "@/components/encounters"
import { Icon } from "@/components/ui"
import { useEncounter } from "@/contexts"

interface CharacterProps {
  character: Character
}

export default function Character({ character }: CharacterProps) {
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
        <Typography
          variant="caption"
          sx={{ textTransform: "lowercase", fontVariant: "small-caps" }}
        >
          {CS.archetype(character)}{" "}
          {CS.faction(character)?.name && (
            <>
              {" - "}
              {CS.faction(character)?.name}
            </>
          )}
        </Typography>
        <ActionValues character={character} />
      </Stack>
      <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
        <IconButton>
          <Icon keyword="Actions" size={24} />
        </IconButton>
      </Box>
    </Stack>
  )
}
