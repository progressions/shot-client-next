"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Stack, Alert, Typography, Box } from "@mui/material"
import type { Campaign } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { MembersList, EditCampaignForm } from "@/components/campaigns"
import { useClient } from "@/contexts"
import { HeroImage, SpeedDialMenu } from "@/components/ui"

interface CampaignPageClientProperties {
  campaign: Campaign
}

export default function CampaignPageClient({
  campaign: initialCampaign,
}: CampaignPageClientProperties) {
  const { campaignData } = useCampaign()
  const { user, client } = useClient()

  const [campaign, setCampaign] = useState<Campaign>(initialCampaign)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gameMaster =
    user.gamemaster && campaign.gamemaster && user.id === campaign.gamemaster.id

  useEffect(() => {
    document.title = campaign.name ? `${campaign.name} - Chi War` : "Chi War"
  }, [campaign.name])

  useEffect(() => {
    if (
      campaignData?.campaign &&
      campaignData.campaign.id === initialCampaign.id
    ) {
      setCampaign(campaignData.campaign)
    }
  }, [campaignData, initialCampaign])

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!campaign?.id) return
    if (
      !confirm(
        `Are you sure you want to delete the campaign: ${campaign.name}?`
      )
    )
      return

    try {
      await client.deleteCampaign(campaign)
      handleMenuClose()
      redirect("/campaigns")
    } catch (error_) {
      console.error("Failed to delete campaign:", error_)
      setError("Failed to delete campaign.")
    }
  }

  const replaceCampaign = (updatedCampaign: Campaign) => {
    setCampaign(updatedCampaign)
  }

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onEdit={() => setEditOpen(true)} onDelete={handleDelete} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="h4">{campaign.name}</Typography>
      </Box>
      <HeroImage entity={campaign} />
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={campaign.description}
          html={campaign.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>
      {gameMaster && (
        <Stack direction="column" spacing={2}>
          <MembersList campaign={campaign} setCampaign={replaceCampaign} />
        </Stack>
      )}
      <EditCampaignForm
        key={JSON.stringify(campaign)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        campaign={campaign}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
