import { headers } from "next/headers"
import { redirect, isRedirectError } from "next/navigation"
import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getCurrentUser } from "@/lib"
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

  try {
    const response = await client.getParty({ id })
    const party = response.data
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
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error(error)
    return <NotFound />
  }
}
