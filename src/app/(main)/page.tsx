import { CircularProgress } from "@mui/material"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Campaign } from "@/types/types"
import { Dashboard } from "@/components/dashboard"

export const metadata = {
  title: "Chi War"
}

export default async function HomePage() {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  const campaignResponse = await client.getCurrentCampaign()
  const campaign = campaignResponse.data as Campaign

  const searchUserId = (campaign && campaign.gamemaster?.id === user.id) ? null: user.id

  const fightsResponse = await client.getFights({ user_id: searchUserId, per_page: 5, sort: "created_at", order: "desc"})
  const fights = fightsResponse.data?.fights || []

  const charactersResponse = await client.getCharacters({ user_id: searchUserId, per_page: 5, sort: "created_at", order: "desc" })
  const characters = charactersResponse.data?.characters || []

  const campaignMembershipsResponse = await client.getCampaigns()
  const campaignMemberships = campaignMembershipsResponse.data || { gamemaster: [], player: [] }

  const partiesResponse = await client.getParties({ user_id: searchUserId, per_page: 5 })
  const parties = partiesResponse.data?.parties || []

  return (
    <Suspense fallback={<CircularProgress />}>
      <Dashboard user={user} campaign={campaign} fights={fights} characters={characters} campaignMemberships={campaignMemberships} parties={parties} />
    </Suspense>
  )
}
