"use client"

import type { Faction } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type MembersListProperties = {
  faction: Faction
  setFaction: (faction: Faction) => void
}

export default function MembersList({
  faction,
  setFaction,
}: MembersListProperties) {
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
      collection="characters"
      collection_ids="character_ids"
      title="Faction Members"
      description={
        <>
          A <InfoLink href="/factions" info="Faction" /> recruits{" "}
          <InfoLink href="/characters" info="Characters" /> to join its cause,{" "}
          acting as a unified force in the world of the{" "}
          <InfoLink info="Chi War" />.
        </>
      }
      update={update}
    />
  )
}
