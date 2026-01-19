import { cache } from "react"
import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getServerClient, getCurrentUser } from "@/lib"
import type { Fight } from "@/types"
import { NotFound, Show } from "@/components/fights"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

type FightPageProperties = {
  params: Promise<{ slugOrId: string }>
}

/**
 * Cached fight fetcher - deduplicates API calls within a single request.
 */
const getFight = cache(async (id: string): Promise<Fight | null> => {
  const client = await getServerClient()
  if (!client) return null

  try {
    const response = await client.getFight({ id })
    return response.data
  } catch (error) {
    console.error("Fetch fight error:", error)
    return null
  }
})

export async function generateMetadata({ params }: FightPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)

  const fight = await getFight(id)
  if (!fight) {
    return {
      title: "Fight Not Found - Chi War",
      description: "The requested fight could not be found",
    }
  }

  return {
    title: `${fight.name || "Fight"} - Chi War`,
    description: `Fight details${fight.name ? ` for ${fight.name}` : ""}`,
  }
}

export default async function FightPage({ params }: FightPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  // Use cached getFight - this reuses the result from generateMetadata
  const fight = await getFight(id)
  if (!fight) {
    return <NotFound />
  }

  // Redirect outside try-catch to avoid catching Next.js redirect errors
  const canonicalId = buildSluggedId(fight.name, fight.id)
  if (canonicalId !== slugOrId) {
    redirect(sluggedPath("fights", fight.name, fight.id))
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs client={client} />
      <Suspense fallback={<CircularProgress />}>
        <Show fight={fight} initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}
