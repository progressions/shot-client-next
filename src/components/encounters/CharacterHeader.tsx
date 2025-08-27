import { Typography, Stack } from "@mui/material"
import { type Character } from "@/types"
import { CharacterLink } from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"
import { CS } from "@/services"

type CharacterHeaderProps = {
  character: Character
}

export default function CharacterHeader({ character }: CharacterHeaderProps) {
  const divider = CS.archetype(character) && CS.faction(character) ? " - " : ""
  return (
    <Stack direction="row" spacing={1} component="span">
      <EntityAvatar entity={character} />
      <Stack direction="column" spacing={0} component="span">
        <CharacterLink character={character} />
        <Typography
          variant="caption"
          sx={{ textTransform: "lowercase", fontVariant: "small-caps" }}
        >
          {CS.archetype(character)}
          {divider}
          {CS.faction(character)?.name}
        </Typography>
      </Stack>
    </Stack>
  )
}
