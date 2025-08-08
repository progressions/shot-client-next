import { Stack, Box, Typography } from "@mui/material"
import { Suspense } from "react"
import { Campaign } from "@/types"
import { UserName } from "@/components/users"
import {
  LoadingModule,
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
  initialIsMobile: boolean
}

export default async function Dashboard({
  user,
  campaign,
  userId,
  initialIsMobile,
}: DashboardProperties) {
  return (
    <Box>
      <Typography variant="h6" color="#fff" gutterBottom>
        Welcome, <UserName user={user} />
      </Typography>
      <CampaignBanner campaign={campaign} />
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
