import { Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Juncture } from "@/types/types"
import { JuncturePageClient } from "@/components/junctures"

type JuncturePageProps = {
  params: Promise<{ id: string }>
}

export default async function JuncturePage({ params }: JuncturePageProps) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getJuncture({ id })
  const juncture: Juncture = response.data

  if (!juncture?.id) {
    return <Typography>Juncture not found</Typography>
  }

  return (
    <JuncturePageClient juncture={juncture} />
  )
}

