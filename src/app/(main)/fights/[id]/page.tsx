import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Fight } from "@/types"
import { FightPageClient } from "@/components/fights"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type FightPageProperties = {
  params: Promise<{ id: string }>
}

export default async function FightPage({ params }: FightPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getFight({ id })
    const fight: Fight = response.data

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs />
        <Suspense fallback={<CircularProgress />}>
          <FightPageClient fight={fight} initialIsMobile={initialIsMobile} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <Typography>Fight not found</Typography>
  }
}
