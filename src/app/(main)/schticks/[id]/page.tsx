import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Schtick } from "@/types"
import { SchtickPageClient } from "@/components/schticks"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type SchtickPageProperties = {
  params: Promise<{ id: string }>
}

export default async function SchtickPage({ params }: SchtickPageProperties) {
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
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <SchtickPageClient schtick={schtick} />
      </Suspense>
    </>
  )
}
