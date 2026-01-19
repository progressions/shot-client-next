// app/adventures/new/page.tsx
// Renders the adventures list with the create form drawer open
import { List } from "@/components/adventures"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { AdventuresResponse } from "@/types"

export const metadata = {
  title: "New Adventure - Chi War",
}

export default async function NewAdventurePage({
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

  // Get default filter values for Adventure entity
  const defaults = getFilterDefaults("Adventure")

  return (
    <ResourcePage
      resourceName="adventures"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Adventure")
        return client.getAdventures(paramsWithDefaults)
      }}
      validSorts={["name", "season", "created_at", "updated_at"]}
      getInitialFormData={(
        data: AdventuresResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        adventures: data.adventures,
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
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
