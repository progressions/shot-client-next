"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { CampaignPopup } from "@/components/popups"
import { CampaignName } from "@/components/campaigns"

type CampaignLinkProperties = {
  campaign: Campaign
  data?: string | object
  disablePopup?: boolean
}

export default function CampaignLink({
  campaign,
  data,
  disablePopup = false,
}: CampaignLinkProperties) {
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  function seasonLabel(campaign) {
    if (campaign.season && campaign.session) {
      // turn session into a two-digit number
      const session = campaign.session.toString().padStart(2, "0")
      return ` (${campaign.season}-${session})`
    }
  }

  return (
    <>
      <Box component="span">
        <Link
          href={`/campaigns/${campaign.id}`}
          target="_blank"
          data-mention-id={campaign.id}
          data-mention-class-name="Campaign"
          data-mention-data={data ? JSON.stringify(data) : undefined}
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            color: "#fff",
          }}
          onClick={!disablePopup ? handleClick : undefined}
        >
          <CampaignName campaign={campaign} />
        </Link>{" "}
        {seasonLabel(campaign)}
      </Box>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <CampaignPopup id={campaign.id} />
        </Box>
      </Popover>
    </>
  )
}
