// app/vehicles/page.tsx
import { List } from "@/components/vehicles"
import ResourcePage from "@/components/ResourcePage"
import type { VehiclesResponse } from "@/types"

export const metadata = {
  title: "Vehicles - Chi War",
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  return (
    <ResourcePage
      resourceName="vehicles"
      fetchData={async (client, params) => client.getVehicles(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: VehiclesResponse, page, sort, order) => ({
        vehicles: data.vehicles,
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
