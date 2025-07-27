import { Suspense } from "react"
import { redirect } from "next/navigation"
import { CircularProgress, Box } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import { Vehicles } from "@/components/vehicles"
import type { VehiclesResponse } from "@/types/types"

export const metadata = {
  title: "Vehicles - Chi War"
}

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<{ page?: string, sort?: string, order?: string }> }) {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  const params = await searchParams
  const pageParam = params.page
  const page = pageParam ? parseInt(pageParam, 10) : 1
  if (isNaN(page) || page <= 0) {
    redirect("/vehicles?page=1&sort=name&order=asc")
  }

  type ValidSort = "name" | "created_at" | "updated_at"
  const validSorts: readonly ValidSort[] = ["name", "created_at", "updated_at"]
  const sort = params.sort && validSorts.includes(params.sort as ValidSort) ? params.sort : "name"

  type ValidOrder = "asc" | "desc"
  const validOrders: readonly ValidOrder[] = ["asc", "desc"]
  const order = params.order && validOrders.includes(params.order as ValidOrder) ? params.order : "asc"

  const response = await client.getVehicles({ page, sort, order })
  const { vehicles, meta }: VehiclesResponse = response.data

  if (page > meta.total_pages) {
    redirect("/vehicles?page=1&sort=name&order=asc")
  }

  return (
    <Box sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Suspense fallback={<CircularProgress />}>
        <Vehicles initialVehicles={vehicles} initialMeta={meta} initialSort={sort} initialOrder={order} />
      </Suspense>
    </Box>
  )
}
