import { CircularProgress, Typography } from "@mui/material"
import { headers } from "next/headers"
import { redirect, isRedirectError } from "next/navigation"
import { getServerClient, getCurrentUser } from "@/lib"
import type { Weapon } from "@/types"
import { NotFound, Show } from "@/components/weapons"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

type WeaponPageProperties = {
  params: Promise<{ slugOrId: string }>
}

export default async function WeaponPage({ params }: WeaponPageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  try {
    const response = await client.getWeapon({ id })
    const weapon: Weapon = response.data
    const canonicalId = buildSluggedId(weapon.name, weapon.id)
    if (canonicalId !== slugOrId) {
      redirect(sluggedPath("weapons", weapon.name, weapon.id))
    }

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
    if (isRedirectError(error)) {
      throw error
    }
    console.error(error)
    return <NotFound />
  }
}
