"use client"

import type { Faction, Character } from "@/types"
import {
  ArchetypeLink,
  TypeLink,
  FactionLink,
  CharacterLink,
} from "@/components/ui"
import { CS } from "@/services"
import { Badge } from "@/components/badges"
import { SystemStyleObject, Theme } from "@mui/system"

type CharacterBadgeProperties = {
  character: Character
  size?: "sm" | "md" | "lg"
  sx?: SystemStyleObject<Theme>
}

export default function CharacterBadge({
  character,
  size = "md",
  sx = {},
}: CharacterBadgeProperties) {
  return (
    <Badge
      name="character"
      entity={character}
      size={size}
      sx={sx}
      title={<CharacterLink character={character} />}
    >
      <TypeLink characterType={CS.type(character)} />{" "}
      {CS.archetype(character) && (
        <>
          {" - "}
          <ArchetypeLink archetype={CS.archetype(character)} />
        </>
      )}
      {CS.faction(character) && (
        <>
          {" - "}
          <FactionLink faction={CS.faction(character) as Faction} />
        </>
      )}
    </Badge>
  )
}
