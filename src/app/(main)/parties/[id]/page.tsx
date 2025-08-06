import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Party } from "@/types"
import { PartyPageClient } from "@/components/parties"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type PartyPageProperties = {
  params: Promise<{ id: string }>
}

export default async function PartyPage({ params }: PartyPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  let party: Party
  try {
    const response = await client.getParty({ id })
    party = response.data
  } catch (error) {
    console.error("Error fetching party:", error)
    return <Typography>Party not found</Typography>
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <PartyPageClient party={party} initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}
