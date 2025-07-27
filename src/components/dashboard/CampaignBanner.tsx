import { Box, Typography } from "@mui/material"
import type { Campaign } from "@/types/types"
import { CampaignName } from "@/components/campaigns"
import { UserName } from "@/components/users"
import { RichTextRenderer } from "@/components/editor"

type CampaignProps = {
  campaign: Campaign
}

export default function CampaignBanner({ campaign }: CampaignProps) {
  return (
    <Box sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: "#1d1d1d", alignItems: "center", textAlign: "center" }}>
      <Typography variant="body2" textAlign="center">
        Current Campaign
      </Typography>
      <Typography variant="h5" textAlign="center" gutterBottom>
        <CampaignName campaign={campaign} />
      </Typography>
      <RichTextRenderer html={campaign.description} />
      <Typography>
        GM: <UserName user={campaign.gamemaster} />
      </Typography>
    </Box>
  )
}
