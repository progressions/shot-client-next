// app/junctures/page.tsx
import { List } from "@/components/junctures"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { JuncturesResponse } from "@/types"

export const metadata = {
  title: "Junctures - Chi War",
}

export default async function JuncturesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    sort?: string
    order?: string
    search?: string
    at_a_glance?: string
  }>
}) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  // Get default filter values for Juncture entity
  const defaults = getFilterDefaults("Juncture")

  return (
    <ResourcePage
      resourceName="junctures"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Juncture")
        return client.getJunctures(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: JuncturesResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        junctures: data.junctures,
        factions: data.factions,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          faction_id: additionalParams?.faction_id || defaults.faction_id || "",
          at_a_glance:
            additionalParams?.at_a_glance || defaults.at_a_glance || false,
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
