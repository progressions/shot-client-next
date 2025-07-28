import { Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Schtick } from "@/types/types"
import { SchtickPageClient } from "@/components/schticks"

type SchtickPageProps = {
  params: Promise<{ id: string }>
}

export default async function SchtickPage({ params }: SchtickPageProps) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getSchtick({ id })
  const schtick: Schtick = response.data

  if (!schtick?.id) {
    return <Typography>Schtick not found</Typography>
  }

  return (
    <SchtickPageClient schtick={schtick} />
  )
}
