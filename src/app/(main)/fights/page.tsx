import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Box, CircularProgress } from "@mui/material"
import { getUser, getServerClient, getPageParameters } from "@/lib"
import { Fights } from "@/components/fights"
import Breadcrumbs from "@/components/Breadcrumbs"
import type { FightsResponse } from "@/types"

export const metadata = {
  title: "Fights - Chi War",
}

export default async function FightsPage({
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
    validSorts: ["created_at", "updated_at", "name"],
    defaultSort: "created_at",
    defaultOrder: "desc",
  })

  // Redirect if page is invalid
  if (page <= 0) {
    redirect("/fights?page=1&sort=created_at&order=desc")
  }

  // Fetch fights for the requested page, sort, and order
  let fightsResponse: FightsResponse = {
    fights: [],
    meta: { current_page: page, total_pages: 1 },
  }
  try {
    const response = await client.getFights({ page, sort, order })
    if (!response.data) {
      throw new Error("No data returned from getFights")
    }
    fightsResponse = response.data
    if (page > fightsResponse.meta.total_pages) {
      redirect("/fights?page=1&sort=created_at&order=desc")
    }
  } catch (error) {
    console.error("Error fetching fights in FightsPage:", error)
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
        <Fights
          initialFights={fightsResponse.fights}
          initialMeta={fightsResponse.meta}
          initialSort={sort}
          initialOrder={order}
          initialIsMobile={initialIsMobile}
        />
      </Suspense>
    </Box>
  )
}
