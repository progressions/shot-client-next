"use client"

import type { Faction } from "@/types"
import { CharacterLink, FactionLink } from "@/components/links"
import { Badge } from "@/components/badges"

type FactionBadgeProps = {
  faction: Faction
  size?: "sm" | "md" | "lg"
}

export default function FactionBadge({
  faction,
  size = "md",
}: FactionBadgeProps) {
  return (
    <Badge
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
