// app/schticks/page.tsx
import { List } from "@/components/schticks"
import ResourcePage from "@/components/ResourcePage"
import type { SchticksResponse } from "@/types"

export const metadata = {
  title: "Schticks - Chi War",
}

export default async function SchticksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  return (
    <ResourcePage
      resourceName="schticks"
      fetchData={async (client, params) => client.getSchticks(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: SchticksResponse, page, sort, order) => ({
        schticks: data.schticks,
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
