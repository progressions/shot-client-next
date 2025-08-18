// app/sites/page.tsx
import { List } from "@/components/sites"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign } from "@/lib"
import type { SitesResponse } from "@/types"

export const metadata = {
  title: "Sites - Chi War",
}

export default async function SitesPage({
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
      resourceName="sites"
      fetchData={async (client, params) => client.getSites(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: SitesResponse, page, sort, order, search) => ({
        sites: data.sites,
        factions: data.factions,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          faction_id: "",
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
