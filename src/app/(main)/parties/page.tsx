import { Suspense } from "react"
import { redirect } from "next/navigation"
import { CircularProgress, Box } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import { Parties } from "@/components/parties"
import type { PartiesResponse } from "@/types/types"

export const metadata = {
  title: "Parties - Chi War"
}

export default async function PartiesPage({ searchParams }: { searchParams: Promise<{ page?: string, sort?: string, order?: string, faction_id?: string }> }) {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  // Resolve searchParams
  const params = await searchParams

  // Extract and validate page parameter
  const pageParam = params.page
  const page = pageParam ? parseInt(pageParam, 10) : 1
  if (isNaN(page) || page <= 0) {
    redirect("/parties?page=1&sort=created_at&order=desc")
  }

  // Extract and validate sort parameter
  type ValidSort = "created_at" | "updated_at" | "name"
  const validSorts: readonly ValidSort[] = ["created_at", "updated_at", "name"]
  const sort = params.sort && validSorts.includes(params.sort as ValidSort) ? params.sort : "created_at"

  // Extract and validate order parameter
  type ValidOrder = "asc" | "desc"
  const validOrders: readonly ValidOrder[] = ["asc", "desc"]
  const order = params.order && validOrders.includes(params.order as ValidOrder) ? params.order : "desc"

  const faction_id = params.faction_id

  // Fetch parties for the requested page, sort, and order
  const response = await client.getParties({ page, sort, order, faction_id })
  const { parties, factions, meta }: PartiesResponse = response.data

  // Check if page exceeds total_pages
  if (page > meta.total_pages) {
    redirect("/parties?page=1&sort=created_at&order=desc")
  }

  return (
    <Box sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Suspense fallback={<CircularProgress />}>
        <Parties initialParties={parties} initialFactions={factions} initialMeta={meta} initialSort={sort} initialOrder={order} />
      </Suspense>
    </Box>
  )
}
