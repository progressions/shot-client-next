import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getServerClient, getCurrentUser } from "@/lib"
import type { Faction } from "@/types"
import { NotFound, Show } from "@/components/factions"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Suspense } from "react"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

type FactionPageProperties = {
  params: Promise<{ slugOrId: string }>
}

export default async function FactionPage({ params }: FactionPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  // Fetch faction data - keep redirect outside try/catch to avoid catching redirect errors
  let faction: Faction | null = null
  try {
    const response = await client.getFaction({ id })
    faction = response.data
  } catch (error) {
    console.error(error)
    return <NotFound />
  }

  // Redirect to canonical URL if needed (must be outside try/catch)
  const canonicalId = buildSluggedId(faction.name, faction.id)
  if (canonicalId !== slugOrId) {
    redirect(sluggedPath("factions", faction.name, faction.id))
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs client={client} />
      <Suspense fallback={<CircularProgress />}>
        <Show faction={faction} initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}
