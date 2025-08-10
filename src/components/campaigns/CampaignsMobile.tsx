"use client"

import { Stack, Typography } from "@mui/material"
import { CampaignDetail } from "@/components/campaigns"
import { useToast } from "@/contexts"

type CampaignsMobileProps = {
  formState
}

export default function CampaignsMobile({ formState }: CampaignsMobileProps) {
  const { toastSuccess } = useToast()
  const { campaigns } = formState.data

  const handleDelete = async () => {
    toastSuccess("Campaign deleted successfully")
  }

  return (
    <Stack spacing={2}>
      {campaigns.length === 0 && (
        <Typography sx={{ color: "#ffffff" }}>
          No campaigns available
        </Typography>
      )}
      {campaigns.map(campaign => (
        <CampaignDetail
          campaign={campaign}
          key={campaign.id}
          onDelete={handleDelete}
        />
      ))}
    </Stack>
  )
}
