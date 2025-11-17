// app/vehicles/page.tsx
import { List } from "@/components/vehicles"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { VehiclesResponse } from "@/types"

export const metadata = {
  title: "Vehicles - Chi War",
}

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    sort?: string
    order?: string
    search?: string
    show_hidden?: string
    [key: string]: string | undefined
  }>
}) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  // Get default filter values for Vehicle entity
  const defaults = getFilterDefaults("Vehicle")

  return (
    <ResourcePage
      resourceName="vehicles"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Vehicle")
        return client.getVehicles(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: VehiclesResponse,
        page,
        sort,
        order,
        search,
        additionalParams
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
          vehicle_type: additionalParams?.vehicle_type || defaults.vehicle_type || "",
          archetype: additionalParams?.archetype || defaults.archetype || "",
          faction_id: additionalParams?.faction_id || defaults.faction_id || "",
          show_hidden: additionalParams?.show_hidden || defaults.show_hidden || false,
        },
        drawerOpen: false,
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
