"use client"

import type { Juncture } from "@/types"
import { CharacterLink, FactionLink, JunctureLink } from "@/components/links"
import { Badge } from "@/components/badges"

type JunctureBadgeProps = {
  juncture: Juncture
  size?: "sm" | "md" | "lg"
}

export default function JunctureBadge({
  juncture,
  size = "md",
}: JunctureBadgeProps) {
  return (
    <Badge
      entity={juncture}
      size={size}
      title={<JunctureLink juncture={juncture} />}
    >
      {juncture.faction && (
        <span>
          <FactionLink faction={juncture.faction} />
          {" - "}
        </span>
      )}
      {juncture.characters?.length === 0 && "No members yet!"}
      {juncture.characters?.slice(0, 3).map((character, index) => (
        <span key={character.id}>
          {index > 0 && ", "}
          <CharacterLink character={character} />
        </span>
      ))}
    </Badge>
  )
}
