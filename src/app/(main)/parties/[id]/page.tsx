import { headers } from "next/headers"
import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getCurrentUser } from "@/lib/getServerClient"
import { NotFound, Show } from "@/components/parties"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type PartyPageProperties = {
  params: Promise<{ id: string }>
}

export default async function PartyPage({ params }: PartyPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getParty({ id })
    const party = response.data

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <Show party={party} initialIsMobile={initialIsMobile} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
