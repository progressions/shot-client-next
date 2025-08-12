"use client"

import type { Faction } from "@/types"
import { Icon, InfoLink, Manager } from "@/components/ui"

type SitesListProperties = {
  entity: Faction
  updateEntity: (faction: Faction) => void
}

export default function SitesList({
  entity,
  updateEntity,
}: SitesListProperties) {
  return (
    <Manager
      icon={<Icon keyword="Sites" />}
      parentEntity={entity}
      childEntityName="Site"
      title="Feng Shui Sites"
      description={
        <>
          A <InfoLink href="/factions" info="Faction" /> attempts to control{" "}
          <InfoLink href="/sites" info="Feng Shui Sites" />, which channel{" "}
          <InfoLink href="/chi" info="Chi" /> to its members.
        </>
      }
      onListUpdate={updateEntity}
    />
  )
}
