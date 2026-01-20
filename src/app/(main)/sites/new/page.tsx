// app/sites/new/page.tsx
// Renders the sites list with the create form drawer open
import { List } from "@/components/sites"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { SitesResponse } from "@/types"

export const metadata = {
  title: "New Site - Chi War",
}

export default async function NewSitePage({
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

  // Get default filter values for Site entity
  const defaults = getFilterDefaults("Site")

  return (
    <ResourcePage
      resourceName="sites"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Site")
        return client.getSites(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: SitesResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        sites: data.sites,
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
          at_a_glance:
            additionalParams?.at_a_glance || defaults.at_a_glance || false,
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
