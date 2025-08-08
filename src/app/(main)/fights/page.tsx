import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { CircularProgress } from "@mui/material"
import { getPageParameters } from "@/lib"
import { Fights } from "@/components/fights"
import Breadcrumbs from "@/components/Breadcrumbs"

export const metadata = {
  title: "Fights - Chi War",
}

export default async function FightsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  // Validate parameters using getPageParameters
  const { page, sort, order } = await getPageParameters(searchParams, {
    validSorts: ["created_at", "updated_at", "name"],
    defaultSort: "created_at",
    defaultOrder: "desc",
  })

  // Redirect if page is invalid (e.g., exceeds total_pages will be checked in Fights)
  if (page <= 0) {
    redirect("/fights?page=1&sort=created_at&order=desc")
  }

  // Detect mobile device on the server
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)

  return (
    <>
      <Suspense fallback={<CircularProgress />}>
        <Breadcrumbs />
      </Suspense>
      <Suspense fallback={<CircularProgress />}>
        <Fights
          page={page}
          sort={sort as "created_at" | "updated_at" | "name"}
          order={order}
          initialIsMobile={initialIsMobile}
        />
      </Suspense>
    </>
  )
}
