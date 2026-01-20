// app/weapons/new/page.tsx
// Renders the weapons list with the create form drawer open
import { List } from "@/components/weapons"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { WeaponsResponse } from "@/types"

export const metadata = {
  title: "New Weapon - Chi War",
}

export default async function NewWeaponPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    sort?: string
    order?: string
    search?: string
    show_hidden?: string
    at_a_glance?: string
    [key: string]: string | undefined
  }>
}) {
  // Server-side campaign check - will redirect if no campaign
  await requireCampaign()

  // Get default filter values for Weapon entity
  const defaults = getFilterDefaults("Weapon")

  return (
    <ResourcePage
      resourceName="weapons"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Weapon")
        return client.getWeapons(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: WeaponsResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        weapons: data.weapons,
        categories: data.categories,
        junctures: data.junctures,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          category: additionalParams?.category || defaults.category || "",
          juncture: additionalParams?.juncture || defaults.juncture || "",
          show_hidden:
            additionalParams?.show_hidden || defaults.show_hidden || false,
          at_a_glance:
            additionalParams?.at_a_glance || defaults.at_a_glance || false,
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
