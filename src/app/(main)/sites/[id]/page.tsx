import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Site } from "@/types"
import { SitePageClient } from "@/components/sites"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type SitePageProperties = {
  params: Promise<{ id: string }>
}

export default async function SitePage({ params }: SitePageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

    try {
  const response = await client.getSite({ id })
  const site: Site = response.data

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <SitePageClient site={site} initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  ) } catch (error) {
    console.error(error)
    return <Typography>Site not found</Typography>
  }
}
