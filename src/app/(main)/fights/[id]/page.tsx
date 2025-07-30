import { Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Fight } from "@/types"
import { FightPageClient } from "@/components/fights"

type FightPageProps = {
  params: Promise<{ id: string }>
}

export default async function FightPage({ params }: FightPageProps) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getFight({ id })
  const fight: Fight = response.data

  if (!fight?.id) {
    return <Typography>Fight not found</Typography>
  }

  return <FightPageClient fight={fight} />
}
