"use client"

import type { Party } from "@/types"
import { CharacterLink, FactionLink, PartyLink } from "@/components/links"
import { Badge } from "@/components/badges"

type PartyBadgeProps = {
  party: Party
  size?: "sm" | "md" | "lg"
}

export default function PartyBadge({ party, size = "md" }: PartyBadgeProps) {
  return (
    <Badge entity={party} size={size} title={<PartyLink party={party} />}>
      {party.faction && (
        <span>
          <FactionLink faction={party.faction} />
          {" - "}
        </span>
      )}
      {party.characters?.length === 0 && "No members yet!"}
      {party.characters?.slice(0, 3).map((character, index) => (
        <span key={character.id}>
          {index > 0 && ", "}
          <CharacterLink character={character} />
        </span>
      ))}
    </Badge>
  )
}
