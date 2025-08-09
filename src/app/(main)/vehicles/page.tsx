import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { CircularProgress, Box } from "@mui/material"
import { List } from "@/components/vehicles"
import { getServerClient, getPageParameters } from "@/lib"
import Breadcrumbs from "@/components/Breadcrumbs"
import type { VehiclesResponse } from "@/types"

export const metadata = {
  title: "Vehicles - Chi War",
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  const client = await getServerClient()

  // Validate parameters using getPageParameters
  const { page, sort, order } = await getPageParameters(searchParams, {
    validSorts: ["name", "created_at", "updated_at"],
    defaultSort: "name",
    defaultOrder: "asc",
  })

  // Redirect if page is invalid
  if (page <= 0) {
    redirect("/vehicles?page=1&sort=name&order=asc")
  }

  // Fetch vehicles for the requested page, sort, and order
  let vehiclesResponse: VehiclesResponse = {
    vehicles: [],
    meta: { current_page: page, total_pages: 1 },
  }
  try {
    const response = await client.getVehicles({ page, sort, order })
    if (!response.data) {
      throw new Error("No data returned from getVehicles")
    }
    vehiclesResponse = response.data
    console.log("vehiclesResponse:", vehiclesResponse)
    if (
      page > vehiclesResponse.meta.total_pages &&
      vehiclesResponse.meta.total_pages > 0
    ) {
      redirect("/vehicles?page=1&sort=name&order=asc")
    }
  } catch (error) {
    console.error("Error fetching vehicles in VehiclesPage:", error)
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
        <List
          initialVehicles={vehiclesResponse.vehicles}
          initialMeta={vehiclesResponse.meta}
          initialSort={sort}
          initialOrder={order}
          initialIsMobile={initialIsMobile}
        />
      </Suspense>
    </Box>
  )
}
