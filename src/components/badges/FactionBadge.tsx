"use client"

import type { FactionBadgeProps } from "@/types"
import CharacterLink from "../ui/links/CharacterLink"
import FactionLink from "../ui/links/FactionLink"
import Badge from "./Badge"

export default function FactionBadge({
  faction,
  size = "md",
}: FactionBadgeProps) {
  return (
    <Badge
      name="faction"
      entity={faction}
      size={size}
      title={<FactionLink faction={faction} />}
    >
      {faction.characters?.length === 0 && "No members yet!"}
      {faction.characters?.slice(0, 3).map((character, index) => (
        <span key={character.id}>
          {index > 0 && ", "}
          <CharacterLink character={character} />
        </span>
      ))}
    </Badge>
  )
}
