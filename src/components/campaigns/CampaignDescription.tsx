"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Campaign } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import type { SystemStyleObject, Theme } from "@mui/system"

interface CampaignDescriptionProperties {
  campaign: Campaign
  sx?: SystemStyleObject<Theme>
}

export default function CampaignDescription({
  campaign,
  sx = {},
}: CampaignDescriptionProperties) {
  const { campaignData } = useCampaign()
  const [displayDescription, setDisplayDescription] = useState(
    campaign.description || ""
  )

  useEffect(() => {
    if (campaignData) {
      const updatedCampaign = campaignData?.campaign
      if (
        updatedCampaign &&
        updatedCampaign.id === campaign.id &&
        updatedCampaign.description
      ) {
        setDisplayDescription(updatedCampaign.description)
      }
    }
  }, [campaignData, campaign.id])

  return <RichTextRenderer html={displayDescription} sx={sx} />
}
