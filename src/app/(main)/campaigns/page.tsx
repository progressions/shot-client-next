// app/campaigns/page.tsx
import { List } from "@/components/campaigns"
import ResourcePage from "@/components/ResourcePage"
import type { CampaignsResponse } from "@/types"

export const metadata = {
  title: "Campaigns - Chi War",
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  return (
    <ResourcePage
      resourceName="campaigns"
      fetchData={async (client, params) => client.getCampaigns(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: CampaignsResponse, page, sort, order) => ({
        campaigns: data.campaigns,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
        },
        drawerOpen: false,
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
