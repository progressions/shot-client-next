"use client"

import type { Party } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type MembersListProperties = {
  party: Party
}

export default function MembersList({ party }: MembersListProperties) {
  const { client } = useClient()

  async function update(partyId: string, formData: FormData) {
    try {
      await client.updateParty(partyId, formData)
    } catch (error) {
      console.error("Error updating party:", error)
      throw error
    }
  }

  return (
    <ListManager
      entity={party}
      name="Party"
      collection="characters"
      collection_ids="character_ids"
      title="Party Members"
      description={
        <>
          A <InfoLink href="/parties" info="Party" /> consists of{" "}
          <InfoLink href="/characters" info="Characters" /> who work together{" "}
          for a <InfoLink href="/factions" info="Faction" />.
        </>
      }
      update={update}
    />
  )
}
