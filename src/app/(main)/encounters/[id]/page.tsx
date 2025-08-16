import { CircularProgress, Typography } from "@mui/material"
import { EncounterProvider } from "@/contexts"
import { headers } from "next/headers"
import { getServerClient, getCurrentUser } from "@/lib"
import type { Encounter } from "@/types"
import { NotFound, Encounter } from "@/components/encounters"
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
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getEncounter({ id })
    const encounter: Encounter = response.data

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <EncounterProvider encounter={encounter}>
            <Encounter
              encounter={encounter}
              initialIsMobile={initialIsMobile}
            />
          </EncounterProvider>
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
