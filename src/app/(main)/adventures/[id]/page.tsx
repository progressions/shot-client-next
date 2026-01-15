import { headers } from "next/headers"
import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getCurrentUser } from "@/lib"
import { NotFound, Show } from "@/components/adventures"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type AdventurePageProperties = {
  params: Promise<{ id: string }>
}

export default async function AdventurePage({ params }: AdventurePageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getAdventure({ id })
    const adventure = response.data

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <Show adventure={adventure} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
