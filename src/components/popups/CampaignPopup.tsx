import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, Campaign } from "@/types"
import { defaultCampaign } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { CampaignAvatar } from "@/components/avatars"
import { useClient } from "@/contexts"
import { CampaignLink } from "@/components/ui"

export default function CampaignPopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [campaign, setCampaign] = useState<Campaign>(defaultCampaign)

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await client.getCampaign({ id })
        const fetchedCampaign = response.data
        console.log("Fetched campaign:", fetchedCampaign)
        if (fetchedCampaign) {
          setCampaign(fetchedCampaign)
        } else {
          console.error(`Campaign with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching campaign:", error)
      }
    }

    if (user?.id && id) {
      fetchCampaign().catch(error => {
        console.error("Failed to fetch campaign:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null // Use null instead of <></> for consistency
  }

  if (!campaign?.id) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2">Loading...</Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    )
  }
  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <CampaignAvatar campaign={campaign} disablePopup={true} />
        <Typography>
          <CampaignLink campaign={campaign} disablePopup={true} />
        </Typography>
      </Stack>
      <Box mt={1}>
        <RichTextRenderer
          key={campaign.description}
          html={campaign.description || ""}
        />
      </Box>
    </Box>
  )
}
