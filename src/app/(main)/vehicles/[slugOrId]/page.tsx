import { cache } from "react"
import { redirect } from "next/navigation"
import { CircularProgress } from "@mui/material"
import { getCurrentUser, getServerClient } from "@/lib"
import type { Vehicle } from "@/types"
import type { Metadata } from "next"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Suspense } from "react"
import { NotFound, Show } from "@/components/vehicles"
import { headers } from "next/headers"
import { extractId, buildSluggedId, sluggedPath } from "@/lib/slug"

/**
 * Cached vehicle fetcher - deduplicates API calls within a single request.
 */
const getVehicle = cache(async (id: string): Promise<Vehicle | null> => {
  const client = await getServerClient()
  if (!client) return null

  try {
    const response = await client.getVehicle({ id })
    return response.data
  } catch (error) {
    console.error("Fetch vehicle error:", error)
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
    return { title: "Vehicle - Chi War" }
  }

  const { slugOrId } = await params
  const id = extractId(slugOrId)

  const vehicle = await getVehicle(id)
  if (!vehicle) {
    return { title: "Vehicle Not Found - Chi War" }
  }
  return { title: `${vehicle.name} - Chi War` }
}

export default async function VehiclePage({
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

  // Use cached getVehicle - this reuses the result from generateMetadata
  const vehicle = await getVehicle(id)
  if (!vehicle) {
    return <NotFound />
  }

  // Redirect outside try-catch to avoid catching Next.js redirect errors
  const canonicalId = buildSluggedId(vehicle.name, vehicle.id)
  if (canonicalId !== slugOrId) {
    redirect(sluggedPath("vehicles", vehicle.name, vehicle.id))
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs client={client} />
      <Suspense fallback={<CircularProgress />}>
        <Show vehicle={vehicle} initialIsMobile={initialIsMobile} />
      </Suspense>
    </>
  )
}
