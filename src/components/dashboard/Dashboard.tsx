import { Stack, Box } from "@mui/material"
import { getCurrentUser } from "@/lib"
import { Suspense } from "react"
import { Campaign } from "@/types"
import {
  LoadingModule,
  PartiesModule,
  CharactersModule,
  FightsModule,
  AdventuresModule,
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
  const isGamemaster = user?.gamemaster || user?.admin || false

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
          <Box sx={{ mb: 2 }}>
            <Suspense fallback={<LoadingModule />}>
              <AdventuresModule userId={user.id} />
            </Suspense>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <FightsModule userId={user.id} />
            <CharactersModule userId={user.id} />
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <PartiesModule userId={user.id} size="small" />
            <SitesModule userId={user.id} size="small" />
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
          <CharactersModule userId={user.id} />
        </Stack>
      )}
    </Box>
  )
}
