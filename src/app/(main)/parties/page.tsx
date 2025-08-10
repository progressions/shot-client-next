// app/parties/page.tsx
import { List } from "@/components/parties"
import ResourcePage from "@/components/ResourcePage"
import type { PartiesResponse } from "@/types"

export const metadata = {
  title: "Parties - Chi War",
}

export default async function PartiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  return (
    <ResourcePage
      resourceName="parties"
      fetchData={async (client, params) => client.getParties(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: PartiesResponse, page, sort, order) => ({
        parties: data.parties,
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
