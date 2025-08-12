"use client"

import type { Faction } from "@/types"
import { Icon, InfoLink, Manager } from "@/components/ui"

type JuncturesListProperties = {
  entity: Faction
  updateEntity: (entity: Faction) => Promise<void>
}

export default function JuncturesList({
  entity,
  updateEntity,
}: JuncturesListProperties) {
  return (
    <Manager
      icon={<Icon keyword="Junctures" />}
      parentEntity={entity}
      childEntityName="Juncture"
      name="junctures"
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
      onListUpdate={updateEntity}
    />
  )
}
