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
  searchParams: Promise<{ page?: string; sort?: string; order?: string, search?: string }>
}) {
  return (
    <ResourcePage
      resourceName="campaigns"
      fetchData={async (client, params) => client.getCampaigns(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: CampaignsResponse, page, sort, order, search) => ({
        campaigns: data.campaigns,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
