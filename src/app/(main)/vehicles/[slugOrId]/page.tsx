import { redirect, isRedirectError } from "next/navigation"
import { CircularProgress } from "@mui/material"
import { getCurrentUser, getServerClient } from "@/lib"
import type { Vehicle } from "@/types"
import type { Metadata } from "next"
import Breadcrumbs from "@/components/Breadcrumbs"
import { Suspense } from "react"
import { NotFound, Show } from "@/components/vehicles"
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
    return { title: "Vehicle - Chi War" }
  }

  const { slugOrId } = await params
  const id = extractId(slugOrId)

  try {
    const response = await client.getVehicle({ id })
    const vehicle: Vehicle = response.data
    if (!vehicle) {
      return { title: "Vehicle Not Found - Chi War" }
    }
    return { title: `${vehicle.name} - Chi War` }
  } catch (error) {
    console.error("Fetch vehicle error for metadata:", error)
    return { title: "Vehicle Not Found - Chi War" }
  }
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

  try {
    const response = await client.getVehicle({ id })
    const vehicle = response.data
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
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    console.error(error)
    return <NotFound />
  }
}
