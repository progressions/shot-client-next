"use client"

import type { Campaign } from "@/types"
import { useClient } from "@/contexts"
import { InfoLink } from "@/components/links"
import { ListManager } from "@/components/lists"

type MembersListProperties = {
  campaign: Campaign
  setCampaign: (campaign: Campaign) => void
}

export default function MembersList({
  campaign,
  setCampaign,
}: MembersListProperties) {
  const { client } = useClient()

  async function update(campaignId: string, formData: FormData) {
    try {
      const response = await client.updateCampaign(campaignId, formData)
      setCampaign(response.data)
    } catch (error) {
      console.error("Error updating campaign:", error)
      throw error
    }
  }

  return (
    <ListManager
      entity={campaign}
      name="Campaign"
      collection="players"
      collection_ids="player_ids"
      title="Campaign Members"
      description={
        <>
          A <InfoLink href="/campaigns" info="Campaign" /> consists of various{" "}
          <InfoLink href="/factions" info="Factions" /> battling for control of{" "}
          the <InfoLink info="Chi War" />.
        </>
      }
      update={update}
    />
  )
}
