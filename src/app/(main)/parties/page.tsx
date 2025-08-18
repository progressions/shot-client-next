// app/parties/page.tsx
import { List } from "@/components/parties"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign } from "@/lib"
import type { PartiesResponse } from "@/types"

export const metadata = {
  title: "Parties - Chi War",
}

export default async function PartiesPage({
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
      resourceName="parties"
      fetchData={async (client, params) => client.getParties(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: PartiesResponse,
        page,
        sort,
        order,
        search
      ) => ({
        parties: data.parties,
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
