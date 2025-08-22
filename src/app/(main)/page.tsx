import { CircularProgress } from "@mui/material"
import { headers, cookies } from "next/headers"
import { Suspense } from "react"
import { getServerClient, requireCampaign } from "@/lib"
import type { Campaign } from "@/types"
import { Dashboard } from "@/components/dashboard"
import { MarketingLanding } from "@/components/marketing"

export const metadata = {
  title: "Chi War - Master Epic Cinematic Adventures",
  description: "The ultimate Feng Shui 2 campaign management platform. Real-time combat, AI character generation, and cross-juncture storytelling await.",
}

export default async function HomePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("jwtToken")?.value

  // If no token, show marketing landing page
  if (!token) {
    return <MarketingLanding />
  }

  // Authenticated user flow
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
