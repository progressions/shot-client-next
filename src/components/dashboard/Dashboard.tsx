import { Stack, Box } from "@mui/material"
import { getCurrentUser } from "@/lib"
import { Suspense } from "react"
import { Campaign } from "@/types"
import {
  LoadingModule,
  PartiesModule,
  CharactersModule,
  FightsModule,
  CampaignBanner,
  SitesModule,
  ActiveFightBanner,
} from "@/components/dashboard"

interface DashboardProperties {
  campaign: Campaign
  initialIsMobile: boolean
}

export default async function Dashboard({
  campaign,
  initialIsMobile: _initialIsMobile,
}: DashboardProperties) {
  const user = await getCurrentUser()
  const isGamemaster = user?.gamemaster || false

  return (
    <Box>
      <CampaignBanner campaign={campaign} />
      <ActiveFightBanner
        campaignId={campaign.id}
        userId={user.id}
        isGamemaster={isGamemaster}
      />

      {/* Gamemaster view - full dashboard */}
      {isGamemaster && (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Suspense fallback={<LoadingModule />}>
              <FightsModule userId={user.id} />
            </Suspense>
            <Suspense fallback={<LoadingModule />}>
              <CharactersModule userId={user.id} />
            </Suspense>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Suspense fallback={<LoadingModule />}>
              <PartiesModule userId={user.id} size="small" />
            </Suspense>
            <Suspense fallback={<LoadingModule />}>
              <SitesModule userId={user.id} size="small" />
            </Suspense>
          </Stack>
        </>
      )}

      {/* Player view - just characters */}
      {!isGamemaster && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Suspense fallback={<LoadingModule />}>
            <CharactersModule userId={user.id} />
          </Suspense>
        </Stack>
      )}
    </Box>
  )
}
