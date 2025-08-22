"use client"

import type { Campaign } from "@/types"
import { CampaignLink } from "@/components/ui"
import { Badge } from "@/components/badges"
import { Chip, Box } from "@mui/material"
import { useApp } from "@/contexts"
import type { SystemStyleObject, Theme } from "@mui/system"

type CampaignBadgeProperties = {
  campaign: Campaign
  size?: "sm" | "md" | "lg"
  role: "gamemaster" | "player"
  sx?: SystemStyleObject<Theme>
}

export default function CampaignBadge({
  campaign,
  size = "md",
  role,
  sx,
}: CampaignBadgeProperties) {
  const { campaign: currentCampaign } = useApp()
  const isActive = currentCampaign?.id === campaign.id

  const memberCount = campaign.user_ids?.length || 0
  const roleText = role === "gamemaster" ? "GM" : "Player"

  return (
    <Box sx={{ position: "relative", width: "100%", ...sx }}>
      <Badge
        name="campaign"
        entity={campaign}
        size={size}
        title={<CampaignLink campaign={campaign} />}
        sx={{ width: "100%" }}
      >
        {memberCount} {memberCount === 1 ? "member" : "members"} • {roleText}
      </Badge>
      {isActive && (
        <Chip
          label="Active"
          color="primary"
          size="small"
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            fontSize: "0.625rem",
            height: 20,
          }}
        />
      )}
    </Box>
  )
}
