// app/fights/page.tsx
import { List } from "@/components/fights"
import ResourcePage from "@/components/ResourcePage"
import type { FightsResponse } from "@/types"

export const metadata = {
  title: "Fights - Chi War",
}

export default async function FightsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  return (
    <ResourcePage
      resourceName="fights"
      fetchData={async (client, params) => client.getFights(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: FightsResponse, page, sort, order) => ({
        fights: data.fights,
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
