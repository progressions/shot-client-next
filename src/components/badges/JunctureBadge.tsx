"use client"

import type { Juncture } from "@/types"
import CharacterLink from "../ui/links/CharacterLink"
import FactionLink from "../ui/links/FactionLink"
import JunctureLink from "../ui/links/JunctureLink"
import Badge from "./Badge"

type JunctureBadgeProperties = {
  juncture: Juncture
  size?: "sm" | "md" | "lg"
}

export default function JunctureBadge({
  juncture,
  size = "md",
}: JunctureBadgeProperties) {
  return (
    <Badge
      name="juncture"
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
