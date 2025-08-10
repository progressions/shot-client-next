"use client"

import { Avatar, Link } from "@mui/material"
import { RefObject, useRef } from "react"
import type { Campaign } from "@/types"
import { SystemStyleObject, Theme } from "@mui/system"

interface CampaignAvatarProperties {
  campaign: Campaign
  href?: string
  disablePopup?: boolean
  sx?: SystemStyleObject<Theme>
}

const CampaignAvatar = ({
  campaign,
  href,
  disablePopup,
  sx = {},
}: CampaignAvatarProperties) => {
  const avatarReference: RefObject<HTMLDivElement | null> = useRef(null)

  if (!campaign?.id) {
    return <></>
  }

  const initials = campaign.name
    ? campaign.name
        .split(" ")
        .map(part => part.charAt(0).toUpperCase())
        .join("")
    : ""

  const baseAvatar = (
    <Avatar
      alt={campaign.name}
      src={campaign.image_url || ""}
      ref={avatarReference}
      sx={sx}
    >
      {initials}
    </Avatar>
  )

  if (disablePopup) {
    return baseAvatar
  }

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        data-mention-id={campaign.id}
        data-mention-class-name="Campaign"
        sx={{ padding: 0, ml: -1.5 }}
      >
        {baseAvatar}
      </Link>
    )
  }

  return baseAvatar
}

export default CampaignAvatar
