import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Faction } from "@/types"
import { FactionPageClient } from "@/components/factions"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Suspense } from "react"

type FactionPageProperties = {
  params: Promise<{ id: string }>
}

export default async function FactionPage({ params }: FactionPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getFaction({ id })
  const faction: Faction = response.data

  if (!faction?.id) {
    return <Typography>Faction not found</Typography>
  }

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <FactionPageClient faction={faction} />
      </Suspense>
    </>
  )
}
