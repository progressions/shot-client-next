"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Campaign } from "@/types"

interface CampaignNameProperties {
  campaign: Campaign
}

export default function CampaignName({ campaign }: CampaignNameProperties) {
  const { subscribeToEntity } = useCampaign()
  const [displayName, setDisplayName] = useState(campaign.name)

  // Subscribe to campaign updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("campaign", data => {
      if (data && data.id === campaign.id && data.name) {
        setDisplayName(data.name)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, campaign.id])

  return <>{displayName}</>
}
