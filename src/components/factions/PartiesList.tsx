"use client"

import type { Faction } from "@/types"
import { InfoLink, ListManager } from "@/components/ui"

type PartiesListProperties = {
  entity: Faction
  updateEntity: (entity: Faction) => Promise<void>
}

export default function PartiesList({
  entity,
  updateEntity,
}: PartiesListProperties) {
  return (
    <ListManager
      parent={entity}
      collectionName="parties"
      collection_ids="party_ids"
      title="Parties"
      description={
        <>
          A <InfoLink href="/factions" info="Faction" /> organizes its members
          into <InfoLink href="/parties" info="Parties" />, allowing them to
          work together on missions and adventures in the world of the{" "}
          <InfoLink info="Chi War" />.
        </>
      }
      updateParent={updateEntity}
    />
  )
}
