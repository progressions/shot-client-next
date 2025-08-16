import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { getServerClient, getCurrentUser } from "@/lib/getServerClient"
import type { Weapon } from "@/types"
import { NotFound, Show } from "@/components/weapons"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"

type WeaponPageProperties = {
  params: Promise<{ id: string }>
}

export default async function WeaponPage({ params }: WeaponPageProperties) {
  const { id } = await params
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getWeapon({ id })
    const weapon: Weapon = response.data

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs client={client} />
        <Suspense fallback={<CircularProgress />}>
          <Show weapon={weapon} initialIsMobile={initialIsMobile} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
