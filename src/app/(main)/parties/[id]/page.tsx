import { Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Party } from "@/types/types"
import { PartyPageClient } from "@/components/parties"

type PartyPageProps = {
  params: Promise<{ id: string }>
}

export default async function PartyPage({ params }: PartyPageProps) {
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
    <PartyPageClient party={party} />
  )
}
