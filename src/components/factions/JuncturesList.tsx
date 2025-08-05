"use client"

import type { Faction } from "@/types"
import { Icon, InfoLink, ListManager } from "@/components/ui"

type JuncturesListProperties = {
  entity: Faction
  updateEntity: (entity: Faction) => Promise<void>
}

export default function JuncturesList({
  entity,
  updateEntity,
}: JuncturesListProperties) {
  return (
    <ListManager
      icon={<Icon keyword="Junctures" />}
      entity={entity}
      name="junctures"
      collection="junctures"
      collection_ids="juncture_ids"
      title="Junctures"
      description={
        <>
          A <InfoLink href="/factions" info="Faction" /> controls a{" "}
          <InfoLink href="/junctures" info="Juncture" /> when they control the
          most powerful <InfoLink href="/sites" info="Feng Shui Sites" />. This
          enables them to make grand decisions about the Juncture, such as
          whether it&rsquo;s friendly or hostile to <InfoLink info="Magic" />.
        </>
      }
      updateEntity={updateEntity}
    />
  )
}
