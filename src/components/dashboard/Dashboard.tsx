"use client"

import { Stack, Box, Typography } from "@mui/material"
import { Site, Party, User, Fight, Character, Campaign } from "@/types"
import { UserName } from "@/components/users"
import {
  PlayFightBanner,
  PartiesModule,
  CharactersModule,
  FightsModule,
  CampaignBanner,
  PlayersModule,
  SitesModule,
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
  const fight = fights[0]

  return (
    <Box>
      <Typography variant="h6" color="#fff" gutterBottom>
        Welcome, <UserName user={user} />
      </Typography>
      { fight.started_at && !fight.ended_at && <PlayFightBanner fight={fight} />}
      { !(fight.started_at && !fight.ended_at) && <CampaignBanner campaign={campaign} /> }
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <FightsModule fights={fights} />
        <CharactersModule characters={characters} />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <PartiesModule parties={parties} size="small" />
        <SitesModule sites={sites} size="small" />
        <PlayersModule players={players} size="small" />
      </Stack>
    </Box>
  )
}
