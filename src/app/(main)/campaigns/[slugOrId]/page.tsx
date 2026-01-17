import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getServerClient, getCurrentUser } from "@/lib"
import type { Campaign } from "@/types"
import { NotFound, Show } from "@/components/campaigns"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Suspense } from "react"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

type CampaignPageProperties = {
  params: Promise<{ slugOrId: string }>
}

export async function generateMetadata({ params }: CampaignPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()

  if (!client) {
    return {
      title: "Campaign - Chi War",
      description: "View campaign details",
    }
  }

  try {
    const response = await client.getCampaign({ id })
    const campaign: Campaign = response.data
    return {
      title: `${campaign.name} - Chi War`,
      description: `Campaign details for ${campaign.name}`,
    }
  } catch {
    return {
      title: "Campaign Not Found - Chi War",
      description: "The requested campaign could not be found",
    }
  }
}

export default async function CampaignPage({ params }: CampaignPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getCampaign({ id })
    const campaign: Campaign = response.data
    const canonicalId = buildSluggedId(campaign.name, campaign.id)
    if (canonicalId !== slugOrId) {
      redirect(sluggedPath("campaigns", campaign.name, campaign.id))
    }

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <Show campaign={campaign} initialIsMobile={initialIsMobile} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
