// app/factions/page.tsx
import { List } from "@/components/factions"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { FactionsResponse } from "@/types"

export const metadata = {
  title: "Factions - Chi War",
}

export default async function FactionsPage({
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

  // Get default filter values for Faction entity
  const defaults = getFilterDefaults("Faction")

  return (
    <ResourcePage
      resourceName="factions"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Faction")
        return client.getFactions(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: FactionsResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        factions: data.factions,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          show_hidden:
            additionalParams?.show_hidden || defaults.show_hidden || false,
          at_a_glance:
            additionalParams?.at_a_glance || defaults.at_a_glance || false,
        },
        drawerOpen: false,
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
