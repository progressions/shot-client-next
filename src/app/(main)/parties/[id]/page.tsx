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

  const response = await client.getParty({ id })
  const party: Party = response.data

  if (!party?.id) {
    return <Typography>Party not found</Typography>
  }

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <PartyPageClient party={party} />
      </Suspense>
    </>
  )
}
