import { cache } from "react"
import { redirect } from "next/navigation"
import { CircularProgress } from "@mui/material"
import { getCurrentUser, getServerClient } from "@/lib"
import type { Character } from "@/types"
import type { Metadata } from "next"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Suspense } from "react"
import { NotFound, Show } from "@/components/characters"
import { headers } from "next/headers"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

/**
 * Cached character fetcher - deduplicates API calls within a single request.
 * Both generateMetadata and the page component can call this without
 * making duplicate API requests.
 */
const getCharacter = cache(async (id: string): Promise<Character | null> => {
  const client = await getServerClient()
  if (!client) return null

  try {
    const response = await client.getCharacter({ id })
    return response.data
  } catch (error) {
    console.error("Fetch character error:", error)
    return null
  }
})

// Dynamically generate metadata for the page title
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugOrId: string }>
}): Promise<Metadata> {
  const user = await getCurrentUser()
  if (!user) {
    return { title: "Character - Chi War" }
  }

  const { slugOrId } = await params
  const id = extractId(slugOrId)

  const character = await getCharacter(id)
  if (!character) {
    return { title: "Character Not Found - Chi War" }
  }
  return { title: `${character.name} - Chi War` }
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ slugOrId: string }>
}) {
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) {
    redirect("/login")
  }

  const { slugOrId } = await params
  const id = extractId(slugOrId)

  // Use cached getCharacter - this reuses the result from generateMetadata
  const character = await getCharacter(id)
  if (!character) {
    return <NotFound />
  }

  // Redirect outside try-catch to avoid catching Next.js redirect errors
  const canonicalId = buildSluggedId(character.name, character.id)
  if (canonicalId !== slugOrId) {
    redirect(sluggedPath("characters", character.name, character.id))
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs client={client} />
      <Suspense fallback={<CircularProgress />}>
        <Show character={character} initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}
