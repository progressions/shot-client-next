"use client"

import type { Faction } from "@/types"
import { Icon, InfoLink, Manager } from "@/components/ui"

type PartiesListProperties = {
  entity: Faction
  updateEntity: (entity: Faction) => Promise<void>
}

export default function PartiesList({
  entity,
  updateEntity,
}: PartiesListProperties) {
  return (
    <Manager
      icon={<Icon keyword="Parties" />}
      parentEntity={entity}
      childEntityName="Party"
      title="Parties"
      description={
        <>
          A <InfoLink href="/factions" info="Faction" /> organizes its members
          into <InfoLink href="/parties" info="Parties" />, allowing them to
          work together on missions and adventures in the world of the{" "}
          <InfoLink info="Chi War" />.
        </>
      }
      onListUpdate={updateEntity}
    />
  )
}
