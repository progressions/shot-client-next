// app/junctures/page.tsx
import { List } from "@/components/junctures"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign } from "@/lib"
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
  }>
}) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  return (
    <ResourcePage
      resourceName="junctures"
      fetchData={async (client, params) => client.getJunctures(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: JuncturesResponse,
        page,
        sort,
        order,
        search
      ) => ({
        junctures: data.junctures,
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
