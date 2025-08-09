import { redirect } from "next/navigation"
import { CircularProgress } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import type { Character } from "@/types"
import type { Metadata } from "next"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Suspense } from "react"
import { NotFound, Show } from "@/components/characters"
import { headers } from "next/headers"

// Dynamically generate metadata for the page title
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    return { title: "Character - Chi War" }
  }

  const { id } = await params

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
  params: Promise<{ id: string }>
}) {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  const { id } = await params

  try {
    const response = await client.getCharacter({ id })
    const character = response.data

    // Detect mobile device on the server
    const headersState = await headers()
    const userAgent = headersState.get("user-agent") || ""
    const initialIsMobile = /mobile/i.test(userAgent)

    return (
      <>
        <Breadcrumbs />
        <Suspense fallback={<CircularProgress />}>
          <Show character={character} initialIsMobile={initialIsMobile} />
        </Suspense>
      </>
    )
  } catch (error) {
    console.error(error)
    return <NotFound />
  }
}
