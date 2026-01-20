// app/fights/new/page.tsx
// Renders the fights list with the create form drawer open
import { List } from "@/components/fights"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { FightsResponse } from "@/types"

export const metadata = {
  title: "New Fight - Chi War",
}

export default async function NewFightPage({
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

  // Get default filter values for Fight entity
  const defaults = getFilterDefaults("Fight")

  return (
    <ResourcePage
      resourceName="fights"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Fight")
        return client.getFights(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: FightsResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => {
        return {
          fights: data.fights,
          seasons: data.seasons || [],
          meta: data.meta,
          filters: {
            sort,
            order,
            page,
            search: search || "",
            season: additionalParams?.season || "",
            status: additionalParams?.status || defaults.status || "",
            show_hidden: additionalParams?.show_hidden || false,
            at_a_glance:
              additionalParams?.at_a_glance || defaults.at_a_glance || false,
          },
          drawerOpen: false,
        }
      }}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
