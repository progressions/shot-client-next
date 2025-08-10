// app/junctures/page.tsx
import { List } from "@/components/junctures"
import ResourcePage from "@/components/ResourcePage"
import type { JuncturesResponse } from "@/types"

export const metadata = {
  title: "Junctures - Chi War",
}

export default async function JuncturesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  return (
    <ResourcePage
      resourceName="junctures"
      fetchData={async (client, params) => client.getJunctures(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: JuncturesResponse, page, sort, order) => ({
        junctures: data.junctures,
        meta: data.meta,
        sort,
        order,
        page,
        drawerOpen: false,
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
