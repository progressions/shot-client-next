import { Suspense } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { CircularProgress } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import { Schticks } from "@/components/schticks"
import type { SchticksResponse } from "@/types"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Schticks - Chi War",
}

export default async function SchticksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
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
    redirect("/schticks?page=1&sort=created_at&order=desc")
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

  // Fetch schticks for the requested page, sort, and order
  const response = await client.getSchticks({ page, sort, order })
  const { schticks, meta }: SchticksResponse = response.data

  // Check if page exceeds total_pages
  if (page > meta.total_pages) {
    redirect("/schticks?page=1&sort=created_at&order=desc")
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Breadcrumbs />
      <Suspense fallback={<CircularProgress />}>
        <Schticks
          initialSchticks={schticks}
          initialMeta={meta}
          initialSort={sort}
          initialOrder={order}
          initialIsMobile={initialIsMobile}
        />
      </Suspense>
    </>
  )
}
