import { Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Site } from "@/types"
import { SitePageClient } from "@/components/sites"

type SitePageProperties = {
  params: Promise<{ id: string }>
}

export default async function SitePage({ params }: SitePageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getSite({ id })
  const site: Site = response.data

  if (!site?.id) {
    return <Typography>Site not found</Typography>
  }

  return <SitePageClient site={site} />
}
