import { CircularProgress } from "@mui/material"
import { headers } from "next/headers"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Campaign } from "@/types"
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
          initialIsMobile={initialIsMobile}
        />
      </Suspense>
    </>
  )
}
