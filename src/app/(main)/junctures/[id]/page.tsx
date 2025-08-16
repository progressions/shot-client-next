import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Juncture } from "@/types"
import { NotFound, Show } from "@/components/junctures"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type JuncturePageProperties = {
  params: Promise<{ id: string }>
}

export default async function JuncturePage({ params }: JuncturePageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getJuncture({ id })
    const juncture: Juncture = response.data

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <Show juncture={juncture} initialIsMobile={initialIsMobile} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
