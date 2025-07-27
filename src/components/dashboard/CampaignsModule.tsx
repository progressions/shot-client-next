import type { CampaignsResponse } from "@/types/types"
import { Stack, Box, Typography } from "@mui/material"
import { CampaignName } from "@/components/campaigns"
import Link from "next/link"

type CampaignsModuleProps = {
  campaignMemberships: CampaignsResponse
}

export default function CampaignsModule({ campaignMemberships }: CampaignsModuleProps) {
  return (
    <Box sx={{ width: "100%", p: 2, mb: 2, borderRadius: 2, backgroundColor: "#1d1d1d", alignItems: "center" }}>
      <Typography variant="h6" gutterBottom>
        Your Campaigns
      </Typography>
      <Stack direction="row" spacing={2}>
        { campaignMemberships.gamemaster.length > 0 && (<>
        <Box sx={{ mb: 2, borderRadius: 2, backgroundColor: "#1d1d1d", alignItems: "center" }}>
          <Typography variant="h6" gutterBottom>
            GM
          </Typography>
          {campaignMemberships.gamemaster.map(camp => (
            <Box key={camp.id} sx={{ mb: 1, p: 1, borderRadius: 1, backgroundColor: "#2d2d2d" }}>
              <Typography variant="body1">
                <Link href={`/campaigns/${camp.id}`} style={{ color: "#fff", textDecoration: "none" }}>
                  <CampaignName campaign={camp} />
                </Link>
              </Typography>
            </Box>
          ))}
        </Box> </>) }
        <Box sx={{ mb: 2, borderRadius: 2, backgroundColor: "#1d1d1d", alignItems: "center" }}>
          <Typography variant="h6" gutterBottom>
            Player
          </Typography>
          {campaignMemberships.player.map(camp => (
            <Box key={camp.id} sx={{ mb: 1, p: 1, borderRadius: 1, backgroundColor: "#2d2d2d" }}>
              <Typography variant="body1">
                <Link href={`/campaigns/${camp.id}`} style={{ color: "#fff", textDecoration: "none" }}>
                  <CampaignName campaign={camp} />
                </Link>
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  )
}
