"use client"

import type { Faction, Character } from "@/types"
import ArchetypeLink from "../ui/links/ArchetypeLink"
import TypeLink from "../ui/links/TypeLink"
import FactionLink from "../ui/links/FactionLink"
import CharacterLink from "../ui/links/CharacterLink"
import { CS } from "@/services"
import Badge from "./Badge"
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
