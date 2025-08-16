import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { getServerClient, getCurrentUser } from "@/lib/getServerClient"
import type { Faction } from "@/types"
import { NotFound, Show } from "@/components/factions"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Suspense } from "react"

type FactionPageProperties = {
  params: Promise<{ id: string }>
}

export default async function FactionPage({ params }: FactionPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getFaction({ id })
    const faction: Faction = response.data

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
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
