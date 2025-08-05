"use client"

import { Stack, Box, Typography } from "@mui/material"
import { Site, Party, User, Fight, Character, Campaign } from "@/types"
import { UserName } from "@/components/users"
import {
  PartiesModule,
  CharactersModule,
  FightsModule,
  CampaignBanner,
  PlayersModule,
} from "@/components/dashboard"

interface DashboardProperties {
  user: User
  campaign: Campaign
  fights: Fight[]
  characters: Character[]
  parties: Party[]
  players: User[]
  sites: Site[]
}

export default function Dashboard({
  user,
  campaign,
  fights,
  characters,
  parties,
  players,
  sites,
}: DashboardProperties) {
  return (
    <Box>
      <Typography variant="h6" color="#fff" gutterBottom>
        Welcome, <UserName user={user} />
      </Typography>
      <CampaignBanner campaign={campaign} />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <FightsModule fights={fights} />
        <CharactersModule characters={characters} />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <PartiesModule parties={parties} />
        <PlayersModule players={players} />
      </Stack>
    </Box>
  )
}
