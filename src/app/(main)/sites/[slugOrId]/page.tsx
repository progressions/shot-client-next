import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getServerClient, getCurrentUser } from "@/lib"
import type { Site } from "@/types"
import { NotFound, Show } from "@/components/sites"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

type SitePageProperties = {
  params: Promise<{ slugOrId: string }>
}

export default async function SitePage({ params }: SitePageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getSite({ id })
    const site: Site = response.data
    const canonicalId = buildSluggedId(site.name, site.id)
    if (canonicalId !== slugOrId) {
      redirect(sluggedPath("sites", site.name, site.id))
    }

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <Show site={site} initialIsMobile={initialIsMobile} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
