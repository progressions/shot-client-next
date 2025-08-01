"use client"

import type { Fight } from "@/types"
import { CharacterLink, FightLink } from "@/components/links"
import { Badge } from "@/components/badges"

type FightBadgeProperties = {
  fight: Fight
  size?: "sm" | "md" | "lg"
}

export default function FightBadge({
  fight,
  size = "md",
}: FightBadgeProperties) {
  return (
    <Badge
      name="fight"
      entity={fight}
      size={size}
      title={<FightLink fight={fight} />}
    >
      {fight.actors.length === 0 && "No fighters yet!"}
      {fight.actors.slice(0, 3).map((character, index) => (
        <span key={`fight-actor-${character.id}-${index}`}>
          {index > 0 && ", "}
          <CharacterLink character={character} />
        </span>
      ))}
    </Badge>
  )
}
