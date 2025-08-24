import { Box, Typography } from "@mui/material"
import type { Campaign } from "@/types"
import { CampaignName } from "@/components/campaigns"
import { UserName } from "@/components/users"
import { RichTextRenderer } from "@/components/editor"

type CampaignProperties = {
  campaign: Campaign
}

export default function CampaignBanner({ campaign }: CampaignProperties) {
  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        backgroundColor: "#1d1d1d",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background image container */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          backgroundImage: campaign.image_url
            ? `url(${campaign.image_url})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 1,
        }}
      />
      {/* Overlay to ensure text readability */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 2,
        }}
      />
      {/* Content container with semi-transparent background */}
      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          borderRadius: 1,
          p: 2,
          mt: 10,
          mx: "auto",
          maxWidth: "80%",
        }}
      >
        <Typography variant="body2" color="white" textAlign="center">
          Current Campaign
        </Typography>
        <Typography variant="h5" color="white" textAlign="center" gutterBottom>
          <CampaignName campaign={campaign} />
        </Typography>
        <RichTextRenderer html={campaign.description} />
        <Typography color="white">
          GM: <UserName user={campaign.gamemaster} />
        </Typography>
      </Box>
    </Box>
  )
}
