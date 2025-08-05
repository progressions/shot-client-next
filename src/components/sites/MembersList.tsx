"use client"

import type { Site } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink, ListManager } from "@/components/ui"

type MembersListProperties = {
  site: Site
  setSite: (site: Site) => void
}

export default function MembersList({ site, setSite }: MembersListProperties) {
  const { client } = useClient()

  async function update(siteId: string, formData: FormData) {
    try {
      const response = await client.updateSite(siteId, formData)
      setSite(response.data)
    } catch (error) {
      console.error("Error updating site:", error)
      throw error
    }
  }

  return (
    <ListManager
      entity={site}
      name="Site"
      collection="characters"
      collection_ids="character_ids"
      title="Site Members"
      description={
        <>
          A <InfoLink href="/sites" info="Feng Shui Site" /> is a location whose
          energy flow produces powerful <InfoLink info="Chi" /> for those{" "}
          <InfoLink info="Attuned" /> to it.{" "}
        </>
      }
      updateEntity={update}
    />
  )
}
