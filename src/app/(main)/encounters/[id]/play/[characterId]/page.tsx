import { Typography } from "@mui/material"
import { EncounterProvider } from "@/contexts"
import { getServerClient, getCurrentUser, requireCampaign } from "@/lib"
import type { Encounter } from "@/types"
import { NotFound } from "@/components/encounters"
import PlayerEncounterView from "@/components/encounters/player/PlayerEncounterView"

type PlayerEncounterPageProperties = {
  params: Promise<{ id: string; characterId: string }>
}

export default async function PlayerEncounterPage({
  params,
}: PlayerEncounterPageProperties) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  const { id, characterId } = await params
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getEncounter({ id })
    const encounter: Encounter = response.data

    return (
      <EncounterProvider encounter={encounter}>
        <PlayerEncounterView characterId={characterId} />
      </EncounterProvider>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
