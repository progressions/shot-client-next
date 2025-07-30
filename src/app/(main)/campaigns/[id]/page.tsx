import { Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Campaign } from "@/types"
import { CampaignPageClient } from "@/components/campaigns"

type CampaignPageProperties = {
  params: Promise<{ id: string }>
}

export default async function CampaignPage({ params }: CampaignPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getCampaign({ id })
  const campaign: Campaign = response.data

  if (!campaign?.id) {
    return <Typography>Campaign not found</Typography>
  }

  return <CampaignPageClient campaign={campaign} />
}
