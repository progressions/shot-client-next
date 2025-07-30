"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Alert,
  Typography,
} from "@mui/material"
import type { Campaign } from "@/types"
import Link from "next/link"
import { CampaignDescription } from "@/components/campaigns"
import { useCampaign, useClient } from "@/contexts"
import { UserName } from "@/components/names"
import DetailButtons from "@/components/DetailButtons"

interface CampaignDetailProperties {
  campaign: Campaign
  onDelete: (campaignId: string) => void
  onEdit: (campaign: Campaign) => void
}

export default function CampaignDetail({
  campaign: initialCampaign,
  onDelete,
  onEdit,
}: CampaignDetailProperties) {
  const { user, client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign)

  const gameMaster =
    user.gamemaster && campaign.gamemaster && user.id === campaign.gamemaster.id

  useEffect(() => {
    if (
      campaignData?.campaign &&
      campaignData.campaign.id === initialCampaign.id
    ) {
      setCampaign(campaignData.campaign)
    }
  }, [campaignData, initialCampaign])

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
      onDelete(campaign.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete campaign"
      )
      console.error("Delete campaign error:", error_)
    }
  }

  const handleEdit = () => {
    onEdit(campaign)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = campaign.created_at
    ? new Date(campaign.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    : "Unknown"

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      {campaign.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={campaign.image_url}
          alt={campaign.name}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ p: "1rem" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <Link href={`/campaigns/${campaign.id}`} style={{ color: "#fff" }}>
              {campaign.name}
            </Link>
          </Typography>
          {gameMaster && (
            <DetailButtons
              name="Campaign"
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </Box>
        <CampaignDescription campaign={campaign} />
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          {campaign.players && campaign.players.length > 0
            ? campaign.players.map((member, index) => (
                <span key={`${member.id}-${index}`}>
                  <UserName user={member} />
                  {index < campaign.players.length - 1 && ", "}
                </span>
              ))
            : null}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          Created: {formattedCreatedAt}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
