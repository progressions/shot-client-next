"use client"
import EntityLink from "./EntityLink"
import dynamic from "next/dynamic"

const CampaignPopup = dynamic(() => import("@/components/popups/CampaignPopup"), {
  ssr: false,
})

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
      popupOverride={CampaignPopup}
      sx={sx}
    >
      {children || campaign.name}
    </EntityLink>
  )
}
