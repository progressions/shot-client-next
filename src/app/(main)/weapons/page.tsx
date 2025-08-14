// app/weapons/page.tsx
import { List } from "@/components/weapons"
import ResourcePage from "@/components/ResourcePage"
import type { WeaponsResponse } from "@/types"

export const metadata = {
  title: "Weapons - Chi War",
}

export default async function WeaponsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  return (
    <ResourcePage
      resourceName="weapons"
      fetchData={async (client, params) => client.getWeapons(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: WeaponsResponse, page, sort, order, search) => ({
        weapons: data.weapons,
        categories: data.categories,
        junctures: data.junctures,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          category: "",
          juncture: "",
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
