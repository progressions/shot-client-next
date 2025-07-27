"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Campaign } from "@/types/types"

interface CampaignNameProps {
  campaign: Campaign
}

export default function CampaignName({ campaign }: CampaignNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(campaign.name)

  useEffect(() => {
    if (campaignData && "campaign" in campaignData) {
      const updatedCampaign = campaignData.campaign
      if (updatedCampaign && updatedCampaign.id === campaign.id) {
        if (updatedCampaign.name) {
          setDisplayName(updatedCampaign.name)
        }
      }
    }
  }, [campaignData, campaign.id])

  return (<>
    {displayName}
  </>)
}

