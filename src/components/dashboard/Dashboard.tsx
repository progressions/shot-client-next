import { Stack, Box, Typography, CircularProgress } from "@mui/material"
import { Suspense } from "react"
import { getServerClient } from "@/lib/getServerClient"
import { Party, Campaign } from "@/types"
import { UserName } from "@/components/users"
import {
  LoadingModule,
  PlayFightBanner,
  PartiesModule,
  CharactersModule,
  FightsModule,
  CampaignBanner,
  SitesModule,
} from "@/components/dashboard"

interface DashboardProperties {
  user: User
  campaign: Campaign
  userId: string | null
  parties: Party[]
  initialIsMobile: boolean
}

export default async function Dashboard({
  user,
  campaign,
  userId,
  parties,
  initialIsMobile,
}: DashboardProperties) {
  return (
    <Box>
      <Typography variant="h6" color="#fff" gutterBottom>
        Welcome, <UserName user={user} />
      </Typography>
      {!(await (async () => {
        const client = await getServerClient()
        const fightsResponse = await client.getFights({
          user_id: userId,
          unended: true,
          per_page: 1,
          sort: "created_at",
          order: "desc",
        })
        const fight = fightsResponse.data?.fights?.[0]
        return fight?.started_at && !fight?.ended_at
      })()) && <CampaignBanner campaign={campaign} />}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Suspense fallback={<LoadingModule />}>
          <FightsModule userId={userId} />
        </Suspense>
        <Suspense fallback={<LoadingModule />}>
          <CharactersModule userId={userId} />
        </Suspense>
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Suspense fallback={<LoadingModule />}>
          <PartiesModule userId={userId} size="small" />
        </Suspense>
        <Suspense fallback={<LoadingModule />}>
          <SitesModule userId={userId} size="small" />
        </Suspense>
      </Stack>
    </Box>
  )
}
