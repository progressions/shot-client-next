import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Encounter } from "@/types"
import { Encounter } from "@/components/encounters"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type EncounterPageProperties = {
  params: Promise<{ id: string }>
}

export default async function EncounterPage({
  params,
}: EncounterPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getEncounter({ id })
  const encounter: Encounter = response.data

  if (!encounter?.id) {
    return <Typography>Fight not found</Typography>
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <Encounter encounter={encounter} initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}
