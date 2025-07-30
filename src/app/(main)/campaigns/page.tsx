import { Suspense } from "react"
import { redirect } from "next/navigation"
import { CircularProgress, Box } from "@mui/material"
import { getUser, getServerClient } from "@/lib/getServerClient"
import { Campaigns } from "@/components/campaigns"
import type { CampaignsResponse } from "@/types"

export const metadata = {
  title: "Campaigns - Chi War",
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  const client = await getServerClient()
  const user = await getUser()
  if (!client || !user) {
    redirect("/login")
  }

  if (!user.gamemaster) redirect("/")

  // Resolve searchParams
  const parameters = await searchParams

  // Extract and validate page parameter
  const pageParameter = parameters.page
  const page = pageParameter ? Number.parseInt(pageParameter, 10) : 1
  if (isNaN(page) || page <= 0) {
    redirect("/campaigns?page=1&sort=created_at&order=desc")
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

  // Fetch campaigns for the requested page, sort, and order
  const response = await client.getCampaigns({ page, sort, order })
  const { campaigns, meta }: CampaignsResponse = response.data

  // Check if page exceeds total_pages
  if (page > meta.total_pages) {
    // redirect("/campaigns?page=1&sort=created_at&order=desc")
  }

  return (
    <Box sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Suspense fallback={<CircularProgress />}>
        <Campaigns
          initialCampaigns={campaigns}
          initialMeta={meta}
          initialSort={sort}
          initialOrder={order}
        />
      </Suspense>
    </Box>
  )
}
