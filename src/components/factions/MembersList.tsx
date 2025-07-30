"use client"

import type { Faction } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type FormStateData = {
  page: number
  open: boolean
  character_id?: string | null
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
      collection="characters"
      collection_ids="character_ids"
      title="Faction Members"
      description={
        <>
          A <InfoLink href="/factions" info="Faction" /> recruits{" "}
          <InfoLink href="/characters" info="Characters" /> to join its cause,
          acting as a unified force in the world of the{" "}
          <InfoLink info="Chi War" />.
        </>
      }
      update={update}
    />
  )
}
