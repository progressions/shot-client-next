"use client"

import { useState } from "react"
import { IconButton, Box, Button, Stack } from "@mui/material"
import type { User, Campaign } from "@/types"
import { UsersAutocomplete } from "@/components/autocomplete"
import { UserBadge } from "@/components/badges"
import { useClient } from "@/contexts"
import DeleteIcon from "@mui/icons-material/Delete"

interface MembersFormProps {
  open: boolean
  campaign: Campaign
}

export default function MembersForm({ open, campaign }: MembersFormProps) {
  const { client } = useClient()
  const [userId, setUser] = useState<string | null>(null)
  const player_ids = campaign.player_ids

  console.log("", userId)

  const handleAutocompleteChange = (value: string | null) => {
    setUser(value)
  }

  const handleAddMember = async () => {
    console.log("Adding member:", userId)
    if (!userId) return
    if (player_ids.includes(userId)) {
      alert("User is already a member of this campaign.")
      return
    }

    try {
      const formData = new FormData()
      const campaignData = {
        ...campaign,
        player_ids: [...player_ids, userId],
      } as Campaign
      console.log("campaignData", campaignData)
      formData.append("campaign", JSON.stringify(campaignData))
      formData.set("campaign", JSON.stringify(campaignData))
      const response = await client.updateCampaign(campaign.id, formData)
      console.log("response", response)

      setUser(null)
    } catch (error) {
      console.error("Error adding campaign member:", error)
      alert("Failed to add user to campaign. Please try again.")
    }
  }

  const handleDelete = async (user: User) => {
    try {
      const formData = new FormData()
      const updatedUserIds = player_ids.filter(id => id !== user.id)
      const campaignData = {
        ...campaign,
        player_ids: updatedUserIds,
      } as Campaign
      formData.append("campaign", JSON.stringify(campaignData))
      await client.updateCampaign(campaign.id, formData)
    } catch (error) {
      console.error("Error removing campaign member:", error)
      alert("Failed to remove user from campaign. Please try again.")
    }
  }

  if (!open) return
  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        border: "1px solid #1e1e1e",
        backgroundColor: "#2f2f2f",
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        <UsersAutocomplete
          value={userId || ""}
          onChange={handleAutocompleteChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddMember}
          sx={{ height: "3rem", px: 2 }}
        >
          Add
        </Button>
      </Stack>
      <Stack direction="column" spacing={1} sx={{ mt: 2 }}>
        {campaign.players && campaign.players.length > 0
          ? campaign.players.map((user: User, index: number) => (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                key={`${user.id}-${index}`}
              >
                <Box sx={{ width: "100%" }}>
                  <UserBadge user={user} />
                </Box>
                <Box>
                  <IconButton
                    color="inherit"
                    onClick={() => handleDelete(user)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            ))
          : null}
      </Stack>
    </Box>
  )
}
