import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { CircularProgress, Box } from "@mui/material"
import { Characters } from "@/components/characters"
import { getUser, getServerClient, getPageParameters } from "@/lib"
import Breadcrumbs from "@/components/Breadcrumbs"
import type { CharactersResponse } from "@/types"

export const metadata = {
  title: "Characters - Chi War",
}

export default async function CharactersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  // Validate parameters using getPageParameters
  const { page, sort, order } = await getPageParameters(searchParams, {
    validSorts: ["name", "created_at", "updated_at"],
    defaultSort: "name",
    defaultOrder: "asc",
  })

  // Redirect if page is invalid
  if (page <= 0) {
    redirect("/characters?page=1&sort=name&order=asc")
  }

  // Fetch characters for the requested page, sort, and order
  let charactersResponse: CharactersResponse = {
    characters: [],
    meta: { current_page: page, total_pages: 1 },
  }
  try {
    const response = await client.getCharacters({ page, sort, order })
    if (!response.data) {
      throw new Error("No data returned from getCharacters")
    }
    charactersResponse = response.data
    if (page > charactersResponse.meta.total_pages) {
      redirect("/characters?page=1&sort=name&order=asc")
    }
  } catch (error) {
    console.error("Error fetching characters in CharactersPage:", error)
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <Box
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        position: "relative",
      }}
    >
      <Suspense fallback={<CircularProgress />}>
        <Breadcrumbs />
      </Suspense>
      <Suspense fallback={<CircularProgress />}>
        <Characters
          initialCharacters={charactersResponse.characters}
          initialMeta={charactersResponse.meta}
          initialSort={sort}
          initialOrder={order}
          initialIsMobile={initialIsMobile}
        />
      </Suspense>
    </Box>
  )
}
