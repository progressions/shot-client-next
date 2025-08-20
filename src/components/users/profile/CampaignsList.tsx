"use client"

import { useState, useCallback } from "react"
import { Box, Stack, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from "@mui/material"
import CancelIcon from "@mui/icons-material/Cancel"
import { CampaignBadge } from "@/components/badges"
import { SectionHeader, Icon } from "@/components/ui"
import { useClient, useToast } from "@/contexts"
import type { User, Campaign } from "@/types"

interface CampaignsListProps {
  user: User
  onUserUpdate: (user: User) => void
}

export default function CampaignsList({ user, onUserUpdate }: CampaignsListProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [leavingCampaign, setLeavingCampaign] = useState<Campaign | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)

  const campaigns = user.campaigns || []
  const playerCampaigns = user.player_campaigns || []

  const handleLeaveCampaign = useCallback(async (campaign: Campaign) => {
    if (!campaign) return
    
    setIsLeaving(true)
    try {
      await client.removePlayer(user, campaign)
      
      // Update user object by removing the campaign from player_campaigns
      const updatedUser = {
        ...user,
        player_campaigns: playerCampaigns.filter(c => c.id !== campaign.id)
      }
      
      onUserUpdate(updatedUser)
      toastSuccess(`Left campaign "${campaign.name}"`)
      setLeavingCampaign(null)
    } catch (error: any) {
      console.error("Failed to leave campaign:", error)
      toastError("Failed to leave campaign")
    } finally {
      setIsLeaving(false)
    }
  }, [client, user, playerCampaigns, onUserUpdate, toastSuccess, toastError])

  const handleLeaveClick = (campaign: Campaign) => {
    setLeavingCampaign(campaign)
  }

  const handleCancelLeave = () => {
    setLeavingCampaign(null)
  }

  if (campaigns.length === 0 && playerCampaigns.length === 0) {
    return (
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Campaigns"
          icon={<Icon keyword="Campaign" />}
          sx={{ mb: 2 }}
        >
          You are not currently part of any campaigns. Ask a gamemaster to invite you!
        </SectionHeader>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No campaigns yet
        </Typography>
      </Box>
    )
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="Campaigns"
          icon={<Icon keyword="Campaign" />}
          sx={{ mb: 2 }}
        >
          All campaigns you participate in, either as gamemaster or player.
        </SectionHeader>
        
        {campaigns.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: "1.125rem" }}>
              As Gamemaster ({campaigns.length})
            </Typography>
            <Stack direction="column" spacing={2}>
              {campaigns.map(campaign => (
                <CampaignBadge
                  key={`gm-${campaign.id}`}
                  campaign={campaign}
                  role="gamemaster"
                  size="md"
                />
              ))}
            </Stack>
          </Box>
        )}

        {playerCampaigns.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontSize: "1.125rem" }}>
              As Player ({playerCampaigns.length})
            </Typography>
            <Stack direction="column" spacing={1}>
              {playerCampaigns.map(campaign => (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  key={`player-${campaign.id}`}
                >
                  <Box sx={{ width: "100%" }}>
                    <CampaignBadge
                      campaign={campaign}
                      role="player"
                      size="md"
                    />
                  </Box>
                  <Box>
                    <Tooltip title="Leave Campaign">
                      <IconButton
                        color="error"
                        onClick={() => handleLeaveClick(campaign)}
                        disabled={isLeaving}
                        sx={{ ml: 1 }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
      </Box>

      <Dialog
        open={!!leavingCampaign}
        onClose={handleCancelLeave}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Leave Campaign</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to leave the campaign "{leavingCampaign?.name}"? 
            You will need to be invited again by the gamemaster to rejoin.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLeave}>Cancel</Button>
          <Button
            onClick={() => leavingCampaign && handleLeaveCampaign(leavingCampaign)}
            color="error"
            variant="contained"
            disabled={isLeaving}
          >
            {isLeaving ? "Leaving..." : "Leave Campaign"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}