import { Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Faction } from "@/types/types"
import { FactionPageClient } from "@/components/factions"

type FactionPageProps = {
  params: Promise<{ id: string }>
}

export default async function FactionPage({ params }: FactionPageProps) {
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
    <FactionPageClient faction={faction} />
  )
}
