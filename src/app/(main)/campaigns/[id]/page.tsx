import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Campaign } from "@/types"
import { CampaignPageClient } from "@/components/campaigns"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Suspense } from "react"

type CampaignPageProperties = {
  params: Promise<{ id: string }>
}

export default async function CampaignPage({ params }: CampaignPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getCampaign({ id })
    const campaign: Campaign = response.data

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs />
        <Suspense fallback={<CircularProgress />}>
          <CampaignPageClient
            campaign={campaign}
            initialIsMobile={initialIsMobile}
          />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <Typography>Campaign not found</Typography>
  }
}
