// app/factions/page.tsx
import { List } from "@/components/factions"
import ResourcePage from "@/components/ResourcePage"
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
  }>
}) {
  return (
    <ResourcePage
      resourceName="factions"
      fetchData={async (client, params) => client.getFactions(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: FactionsResponse,
        page,
        sort,
        order,
        search
      ) => ({
        factions: data.factions,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
        },
        drawerOpen: false,
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
