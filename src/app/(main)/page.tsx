import { CircularProgress } from "@mui/material"
import { headers } from "next/headers"
import { Suspense } from "react"
import { getServerClient, requireCampaign } from "@/lib"
import type { Campaign } from "@/types"
import { Dashboard } from "@/components/dashboard"

export const metadata = {
  title: "Chi War",
}

export default async function HomePage() {
  await requireCampaign()
  
  const client = await getServerClient()
  const campaignResponse = await client.getCurrentCampaign()
  const campaign = campaignResponse.data as Campaign

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Suspense fallback={<CircularProgress />}>
        <Dashboard campaign={campaign} initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}
