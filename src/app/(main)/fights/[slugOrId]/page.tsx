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

export async function generateMetadata({ params }: FightPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()

  if (!client) {
    return {
      title: "Fight - Chi War",
      description: "View fight details",
    }
  }

  try {
    const response = await client.getFight({ id })
    const fight: Fight = response.data
    return {
      title: `${fight.name || "Fight"} - Chi War`,
      description: `Fight details${fight.name ? ` for ${fight.name}` : ""}`,
    }
  } catch {
    return {
      title: "Fight Not Found - Chi War",
      description: "The requested fight could not be found",
    }
  }
}

export default async function FightPage({ params }: FightPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  let fight: Fight
  try {
    const response = await client.getFight({ id })
    fight = response.data
  } catch (error) {
    console.error(error)
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
