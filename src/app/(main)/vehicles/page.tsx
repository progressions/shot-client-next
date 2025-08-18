// app/vehicles/page.tsx
import { List } from "@/components/vehicles"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign } from "@/lib"
import type { VehiclesResponse } from "@/types"

export const metadata = {
  title: "Vehicles - Chi War",
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  return (
    <ResourcePage
      resourceName="vehicles"
      fetchData={async (client, params) => client.getVehicles(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: VehiclesResponse,
        page,
        sort,
        order,
        search
      ) => ({
        vehicles: data.vehicles,
        factions: data.factions,
        archetypes: data.archetypes,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          vehicle_type: "",
          archetype: "",
          faction_id: "",
        },
        drawerOpen: false,
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
