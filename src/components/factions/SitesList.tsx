"use client"

import type { Faction } from "@/types"
import { InfoLink, ListManager } from "@/components/ui"

type SitesListProperties = {
  entity: Faction
  updateEntity: (faction: Faction) => void
}

export default function SitesList({
  entity,
  updateEntity,
}: SitesListProperties) {
  return (
    <ListManager
      entity={entity}
      collection="sites"
      collection_ids="site_ids"
      title="Feng Shui Sites"
      description={
        <>
          A <InfoLink href="/factions" info="Faction" /> attempts to control{" "}
          <InfoLink href="/sites" info="Feng Shui Sites" />, which channel{" "}
          <InfoLink href="/chi" info="Chi" /> to its members.
        </>
      }
      updateEntity={updateEntity}
    />
  )
}
