import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getCurrentUser, requireCampaign } from "@/lib"
import type { Fight } from "@/types"
import { SoloEncounter } from "@/components/solo"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type SoloEncounterPageProps = {
  params: Promise<{ fightId: string }>
}

export default async function SoloEncounterPage({
  params,
}: SoloEncounterPageProps) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  const { fightId } = await params
  const client = await getServerClient()
  const user = await getCurrentUser()

  if (!client || !user) {
    return <Typography>Not logged in</Typography>
  }

  try {
    // Fetch the fight/encounter
    const encounterResponse = await client.getEncounter({ id: fightId })
    const fight = encounterResponse.data as Fight

    // Get current campaign for navigation
    const campaignResponse = await client.getCurrentCampaign()
    const campaignId = campaignResponse?.data?.id

    if (!campaignId) {
      return <Typography>No active campaign</Typography>
    }

    // Verify this is a solo mode fight
    if (!fight.solo_mode) {
      return (
        <Typography>
          This fight is not configured for solo play mode.
        </Typography>
      )
    }

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <SoloEncounter fight={fight} campaignId={campaignId} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error("Error loading solo encounter:", error)
    return <Typography>Fight not found</Typography>
  }
}
