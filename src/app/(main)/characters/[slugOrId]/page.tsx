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

// Dynamically generate metadata for the page title
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slugOrId: string }>
}): Promise<Metadata> {
  const client = await getServerClient()
  const user = await getCurrentUser()
  if (!client || !user) {
    return { title: "Character - Chi War" }
  }

  const { slugOrId } = await params
  const id = extractId(slugOrId)

  try {
    const response = await client.getCharacter({ id })
    const character: Character = response.data
    if (!character) {
      return { title: "Character Not Found - Chi War" }
    }
    return { title: `${character.name} - Chi War` }
  } catch (error) {
    console.error("Fetch character error for metadata:", error)
    return { title: "Character Not Found - Chi War" }
  }
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

  let character: Character
  try {
    const response = await client.getCharacter({ id })
    character = response.data
  } catch (error) {
    console.error(error)
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
