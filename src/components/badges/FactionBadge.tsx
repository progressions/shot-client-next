"use client"

import type { Faction } from "@/types"
import { CharacterLink, FactionLink } from "@/components/ui"
import { Badge } from "@/components/badges"

type FactionBadgeProperties = {
  faction: Faction
  size?: "sm" | "md" | "lg"
}

export default function FactionBadge({
  faction,
  size = "md",
}: FactionBadgeProperties) {
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
