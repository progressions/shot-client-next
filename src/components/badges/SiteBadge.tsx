"use client"

import type { Site } from "@/types"
import { CharacterLink, FactionLink, SiteLink } from "@/components/links"
import { Badge } from "@/components/badges"

type SiteBadgeProps = {
  site: Site
  size?: "sm" | "md" | "lg"
}

export default function SiteBadge({ site, size = "md" }: SiteBadgeProps) {
  return (
    <Badge entity={site} size={size} title={<SiteLink site={site} />}>
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
