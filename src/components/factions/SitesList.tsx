"use client"

import type { Faction } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type FormStateData = {
  page: number
  open: boolean
  site_id?: string | null
}

type SitesListProps = {
  faction: Faction
}

export default function SitesList({ faction }: SitesListProps) {
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
      collection="sites"
      collection_ids="site_ids"
      title="Feng Shui Sites"
      description={
        <>
          A <InfoLink href="/factions" info="Faction" /> attempts to control{" "}
          <InfoLink href="/sites" info="Feng Shui Sites" />, which channel{" "}
          <InfoLink href="/chi" info="Chi" /> to its members.
        </>
      }
      update={update}
    />
  )
}
