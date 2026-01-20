// app/campaigns/new/page.tsx
// Renders the campaigns list with the create form drawer open
import { List } from "@/components/campaigns"
import ResourcePage from "@/components/ResourcePage"
import { applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { CampaignsResponse } from "@/types"

export const metadata = {
  title: "New Campaign - Chi War",
}

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    sort?: string
    order?: string
    search?: string
    at_a_glance?: string
    [key: string]: string | undefined
  }>
}) {
  // Get default filter values for Campaign entity
  const defaults = getFilterDefaults("Campaign")

  return (
    <ResourcePage
      resourceName="campaigns"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Campaign")
        return client.getCampaigns(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: CampaignsResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        campaigns: data.campaigns,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          at_a_glance:
            additionalParams?.at_a_glance || defaults.at_a_glance || false,
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
