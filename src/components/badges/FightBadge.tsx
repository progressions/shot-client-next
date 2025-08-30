"use client"

import type { Fight } from "@/types"
import CharacterLink from "../ui/links/CharacterLink"
import FightLink from "../ui/links/FightLink"
import Badge from "./Badge"

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
      {fight.characters.length === 0 && "No fighters yet!"}
      {fight.characters.slice(0, 3).map((character, index) => (
        <span key={`fight-actor-${character.id}-${index}`}>
          {index > 0 && ", "}
          <CharacterLink character={character} />
        </span>
      ))}
    </Badge>
  )
}
