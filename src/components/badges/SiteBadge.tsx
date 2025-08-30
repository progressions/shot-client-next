"use client"

import type { SiteBadgeProps } from "@/types"
import CharacterLink from "../ui/links/CharacterLink"
import FactionLink from "../ui/links/FactionLink"
import SiteLink from "../ui/links/SiteLink"
import Badge from "./Badge"

export default function SiteBadge({ site, size = "md" }: SiteBadgeProps) {
  return (
    <Badge
      name="site"
      entity={site}
      size={size}
      title={<SiteLink site={site} />}
    >
      {site.faction && (
        <span>
          <FactionLink faction={site.faction} />
          {" - "}
        </span>
      )}
      {site.characters?.length === 0 && "No members yet!"}
      {site.characters?.slice(0, 3).map((character, index) => (
        <span key={character.id}>
          {index > 0 && ", "}
          <CharacterLink character={character} />
        </span>
      ))}
    </Badge>
  )
}
