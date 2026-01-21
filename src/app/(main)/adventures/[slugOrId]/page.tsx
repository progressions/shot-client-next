import { CircularProgress, Typography } from "@mui/material"
import { getServerClient, getCurrentUser } from "@/lib"
import type { Adventure } from "@/types"
import { NotFound, Show } from "@/components/adventures"
import { Suspense } from "react"
import Breadcrumbs from "@/components/Breadcrumbs"
import { redirect } from "next/navigation"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

type AdventurePageProperties = {
  params: Promise<{ slugOrId: string }>
}

export default async function AdventurePage({
  params,
}: AdventurePageProperties) {
  const { slugOrId } = await params
  const id = extractId(slugOrId)
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) return <Typography>Not logged in</Typography>

  // Adventures pages are GM-only - redirect players to characters page
  if (!user.gamemaster && !user.admin) {
    redirect("/characters")
  }

  let adventure: Adventure
  try {
    const response = await client.getAdventure({ id })
    adventure = response.data
  } catch (error) {
    console.error(error)
    return <NotFound />
  }

  // Redirect outside try-catch to avoid catching Next.js redirect errors
  const canonicalId = buildSluggedId(adventure.name, adventure.id)
  if (canonicalId !== slugOrId) {
    redirect(sluggedPath("adventures", adventure.name, adventure.id))
  }

  return (
    <>
      <Breadcrumbs client={client} />
      <Suspense fallback={<CircularProgress />}>
        <Show adventure={adventure} />
      </Suspense>
    </>
  )
}
