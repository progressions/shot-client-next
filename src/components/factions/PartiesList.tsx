"use client"

import type { Faction } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type FormStateData = {
  page: number
  open: boolean
  party_id?: string | null
}

type MembersListProps = {
  faction: Faction
}

export default function MembersList({ faction }: MembersListProps) {
  const { client } = useClient()

  async function update(factionId: string, formData: FormData) {
    try {
      await client.updateFaction(factionId, formData)
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
