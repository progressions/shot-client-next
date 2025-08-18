// app/fights/page.tsx
import { List } from "@/components/fights"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign } from "@/lib"
import type { FightsResponse } from "@/types"

export const metadata = {
  title: "Fights - Chi War",
}

export default async function FightsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    sort?: string
    order?: string
    search?: string
  }>
}) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  return (
    <ResourcePage
      resourceName="fights"
      fetchData={async (client, params) => client.getFights(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: FightsResponse,
        page,
        sort,
        order,
        search
      ) => ({
        fights: data.fights,
        seasons: data.seasons || [],
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search: search || "",
          season: "",
          status: "",
        },
        drawerOpen: false,
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
