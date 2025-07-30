"use client"

import type { Faction } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type FormStateData = {
  page: number
  open: boolean
  juncture_id?: string | null
}

type JuncturesListProps = {
  faction: Faction
}

export default function JuncturesList({ faction }: JuncturesListProps) {
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
      update={update}
    />
  )
}
