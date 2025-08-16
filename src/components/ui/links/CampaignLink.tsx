"use client"
import { EntityLink } from "@/components/ui"

type CampaignLinkProperties = {
  campaign: Campaign
  data?: string | object
  disablePopup?: boolean
  children: React.ReactNode
  sx?: React.CSSProperties
}

export default function CampaignLink({
  campaign,
  data,
  disablePopup = false,
  children,
  sx,
}: CampaignLinkProperties) {
  return (
    <EntityLink
      entity={campaign}
      data={data}
      disablePopup={disablePopup}
      sx={sx}
    >
      {children}
    </EntityLink>
  )
}
