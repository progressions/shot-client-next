import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { CircularProgress, Box } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import { Vehicles } from "@/components/vehicles"

export const metadata = {
  title: "Vehicles - Chi War",
}

type VehiclesPageProperties = {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}

export default async function VehiclesPage({
  searchParams,
}: VehiclesPageProperties) {
  const client = await getServerClient()
  const user = await getUser()

  if (!client || !user) {
    redirect("/login")
  }

  const parameters = await searchParams
  const pageParameter = parameters.page
  const page = pageParameter ? Number.parseInt(pageParameter, 10) : 1

  if (isNaN(page) || page <= 0) {
    redirect("/vehicles?page=1&sort=name&order=asc")
  }

  type ValidSort = "name" | "created_at" | "updated_at"
  const validSorts: readonly ValidSort[] = ["name", "created_at", "updated_at"]
  const sort =
    parameters.sort && validSorts.includes(parameters.sort as ValidSort)
      ? parameters.sort
      : "name"

  type ValidOrder = "asc" | "desc"
  const validOrders: readonly ValidOrder[] = ["asc", "desc"]
  const order =
    parameters.order && validOrders.includes(parameters.order as ValidOrder)
      ? parameters.order
      : "asc"

  const response = await client.getVehicles({ page, sort, order })
  const { vehicles, meta } = response.data

  if (page > meta.total_pages) {
    redirect("/vehicles?page=1&sort=name&order=asc")
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
        <Vehicles
          initialVehicles={vehicles}
          initialMeta={meta}
          initialSort={sort}
          initialOrder={order}
          initialIsMobile={initialIsMobile} // Pass mobile detection result
        />
      </Suspense>
    </Box>
  )
}
