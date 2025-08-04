import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Juncture } from "@/types"
import { JuncturePageClient } from "@/components/junctures"
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

  const response = await client.getJuncture({ id })
  const juncture: Juncture = response.data

  if (!juncture?.id) {
    return <Typography>Juncture not found</Typography>
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <JuncturePageClient
          juncture={juncture}
          initialIsMobile={initialIsMobile}
        />
      </Suspense>
    </>
  )
}
