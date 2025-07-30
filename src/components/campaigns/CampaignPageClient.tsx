"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Button,
  Stack,
  Alert,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import type { Campaign } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { MembersForm, EditCampaignForm } from "@/components/campaigns"
import { useClient } from "@/contexts"
import { UserBadge } from "@/components/badges"

interface CampaignPageClientProps {
  campaign: Campaign
}

export default function CampaignPageClient({
  campaign: initialCampaign,
}: CampaignPageClientProps) {
  const { campaignData } = useCampaign()
  const { user, client } = useClient()

  const [campaign, setCampaign] = useState<Campaign>(initialCampaign)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [editOpen, setEditOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const gameMaster =
    user.gamemaster && campaign.gamemaster && user.id === campaign.gamemaster.id

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

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

  const handleOpenMembers = () => {
    setMembersOpen(prev => !prev)
  }

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="h4">{campaign.name}</Typography>
        <IconButton aria-label="menu" onClick={handleMenuClick}>
          <MoreHorizIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={() => {
              setEditOpen(true)
              handleMenuClose()
            }}
          >
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </Box>
      {campaign.image_url && (
        <Box
          component="img"
          src={campaign.image_url}
          alt={campaign.name}
          sx={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            objectPosition: "50% 20%",
            mb: 2,
            display: "block",
            mx: "auto",
          }}
        />
      )}
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={campaign.description}
          html={campaign.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: { xs: 1, sm: 1.5 },
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Campaign Members
          </Typography>
        </Box>
        {membersOpen && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenMembers}
            sx={{ px: 2 }}
          >
            Close
          </Button>
        )}
        {gameMaster && !membersOpen && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenMembers}
            sx={{ px: 2 }}
          >
            Manage
          </Button>
        )}
      </Box>
      <MembersForm open={membersOpen} campaign={campaign} />
      {!membersOpen && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
            {campaign.players && campaign.players.length > 0
              ? campaign.players.map((user, index) => (
                  <UserBadge key={`${user.id}-${index}`} user={user} />
                ))
              : null}
          </Stack>
        </Box>
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
