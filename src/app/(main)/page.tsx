import { CircularProgress } from "@mui/material"
import { headers } from "next/headers"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Campaign, Party, Site, User } from "@/types"
import { Dashboard } from "@/components/dashboard"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Chi War",
}

export default async function HomePage() {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }
  const campaignResponse = await client.getCurrentCampaign()
  const campaign = campaignResponse.data as Campaign
  const searchUserId =
    campaign && campaign.gamemaster?.id === user.id ? null : user.id

  const partiesResponse = await client.getParties({
    user_id: searchUserId,
    per_page: 5,
    sort: "created_at",
    order: "desc",
  })
  const parties: Party[] = partiesResponse.data?.parties || []

  const sitesResponse = await client.getSites({
    user_id: searchUserId,
    per_page: 5,
    sort: "created_at",
    order: "desc",
  })
  const sites: Site[] = sitesResponse.data?.sites || []

  const usersResponse = await client.getUsers({
    per_page: 5,
    sort: "created_at",
    order: "desc",
  })
  const players: User[] = usersResponse.data?.users || []

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <Dashboard
          user={user}
          campaign={campaign}
          userId={searchUserId}
          parties={parties}
          sites={sites}
          players={players}
          initialIsMobile={initialIsMobile}
        />
      </Suspense>
    </>
  )
}
