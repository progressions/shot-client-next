"use client"

import type { Faction } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type PartiesListProperties = {
  faction: Faction
  setFaction: (faction: Faction) => void
}

export default function PartiesList({
  faction,
  setFaction,
}: PartiesListProperties) {
  const { client } = useClient()

  async function update(factionId: string, formData: FormData) {
    try {
      const response = await client.updateFaction(factionId, formData)
      setFaction(response.data)
    } catch (error) {
      console.error("Error updating faction:", error)
      throw error
    }
  }

  return (
    <ListManager
      entity={faction}
      name="Faction"
      collection="parties"
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
      update={update}
    />
  )
}
