"use client"

import { Stack, Box, Typography } from "@mui/material"
import { Party, User, Fight, Character, Campaign } from "@/types/types"
import { UserName } from "@/components/users"
import { PartiesModule, CampaignsModule, CharactersModule, FightsModule, CampaignBanner } from "@/components/dashboard"

interface DashboardProps {
  user: User
  campaign: Campaign
  fights: Fight[]
  characters: Character[]
  parties: Party[]
  campaignMemberships: { gamemaster: Campaign[], player: Campaign[] }
}

export default function Dashboard({ user, campaign, fights, characters, parties, campaignMemberships }: DashboardProps) {
  return (
    <Box>
      <Typography variant="h6" color="#fff" gutterBottom>
        Welcome, <UserName user={user} />
      </Typography>
      <CampaignBanner campaign={campaign} />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <FightsModule fights={fights} />
        <CharactersModule characters={characters} />
        <PartiesModule parties={parties} />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <CampaignsModule campaignMemberships={campaignMemberships} />
      </Stack>
    </Box>
  )
}
