import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getUser } from "@/lib/getServerClient"
import type { Weapon } from "@/types"
import { WeaponPageClient } from "@/components/weapons"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type WeaponPageProperties = {
  params: Promise<{ id: string }>
}

export default async function WeaponPage({ params }: WeaponPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  const response = await client.getWeapon({ id })
  const weapon: Weapon = response.data

  if (!weapon?.id) {
    return <Typography>Weapon not found</Typography>
  }

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <WeaponPageClient weapon={weapon} />
      </Suspense>
    </>
  )
}
