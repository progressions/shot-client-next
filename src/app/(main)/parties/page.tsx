// app/parties/page.tsx
import { List } from "@/components/parties"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
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
    show_hidden?: string
    at_a_glance?: string
    [key: string]: string | undefined
  }>
}) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  // Get default filter values for Party entity
  const defaults = getFilterDefaults("Party")

  return (
    <ResourcePage
      resourceName="parties"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Party")
        return client.getParties(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: PartiesResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        parties: data.parties,
        factions: data.factions,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          faction_id: additionalParams?.faction_id || defaults.faction_id || "",
          show_hidden:
            additionalParams?.show_hidden || defaults.show_hidden || false,
          at_a_glance: additionalParams?.at_a_glance ?? false,
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
