import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getCurrentUser } from "@/lib"
import type { Party } from "@/types"
import { NotFound, Show } from "@/components/parties"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

type PartyPageProperties = {
  params: Promise<{ slugOrId: string }>
}

export default async function PartyPage({ params }: PartyPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  let party: Party
  try {
    const response = await client.getParty({ id })
    party = response.data
  } catch (error) {
    console.error(error)
    return <NotFound />
  }

  // Redirect outside try-catch to avoid catching Next.js redirect errors
  const canonicalId = buildSluggedId(party.name, party.id)
  if (canonicalId !== slugOrId) {
    redirect(sluggedPath("parties", party.name, party.id))
  }

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
}
