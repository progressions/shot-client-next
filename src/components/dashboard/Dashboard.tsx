import { Stack, Box } from "@mui/material"
import { getCurrentUser } from "@/lib/getServerClient"
import { Suspense } from "react"
import { Campaign } from "@/types"
import {
  LoadingModule,
  PartiesModule,
  CharactersModule,
  FightsModule,
  CampaignBanner,
  SitesModule,
} from "@/components/dashboard"

interface DashboardProperties {
  campaign: Campaign
  initialIsMobile: boolean
}

export default async function Dashboard({
  campaign,
  initialIsMobile,
}: DashboardProperties) {
  const user = await getCurrentUser()
  return (
    <Box>
      <CampaignBanner campaign={campaign} />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Suspense fallback={<LoadingModule />}>
          <FightsModule userId={user.id} />
        </Suspense>
        <Suspense fallback={<LoadingModule />}>
          <CharactersModule userId={user.id} />
        </Suspense>
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Suspense fallback={<LoadingModule />}>
          <PartiesModule userId={user.id} size="small" />
        </Suspense>
        <Suspense fallback={<LoadingModule />}>
          <SitesModule userId={user.id} size="small" />
        </Suspense>
      </Stack>
    </Box>
  )
}
