import { Suspense } from "react"
import { redirect } from "next/navigation"
import { CircularProgress, Box } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import { Junctures } from "@/components/junctures"
import type { JuncturesResponse } from "@/types"

export const metadata = {
  title: "Junctures - Chi War",
}

export default async function JuncturesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    sort?: string
    order?: string
    faction_id?: string
  }>
}) {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  // Resolve searchParams
  const parameters = await searchParams

  // Extract and validate page parameter
  const pageParameter = parameters.page
  const page = pageParameter ? Number.parseInt(pageParameter, 10) : 1
  if (isNaN(page) || page <= 0) {
    redirect("/junctures?page=1&sort=created_at&order=desc")
  }

  // Extract and validate sort parameter
  type ValidSort = "created_at" | "updated_at" | "name"
  const validSorts: readonly ValidSort[] = ["created_at", "updated_at", "name"]
  const sort =
    parameters.sort && validSorts.includes(parameters.sort as ValidSort)
      ? parameters.sort
      : "created_at"

  // Extract and validate order parameter
  type ValidOrder = "asc" | "desc"
  const validOrders: readonly ValidOrder[] = ["asc", "desc"]
  const order =
    parameters.order && validOrders.includes(parameters.order as ValidOrder)
      ? parameters.order
      : "desc"

  const faction_id = parameters.faction_id

  // Fetch junctures for the requested page, sort, and order
  const response = await client.getJunctures({ page, sort, order, faction_id })
  const { junctures, factions, meta }: JuncturesResponse = response.data

  // Check if page exceeds total_pages
  if (page > meta.total_pages) {
    redirect("/junctures?page=1&sort=created_at&order=desc")
  }

  return (
    <Box sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Suspense fallback={<CircularProgress />}>
        <Junctures
          initialJunctures={junctures}
          initialFactions={factions}
          initialMeta={meta}
          initialSort={sort}
          initialOrder={order}
        />
      </Suspense>
    </Box>
  )
}
