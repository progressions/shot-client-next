// app/schticks/page.tsx
import { List } from "@/components/schticks"
import ResourcePage from "@/components/ResourcePage"
import { requireCampaign, applyFilterDefaults, getFilterDefaults } from "@/lib"
import type { SchticksResponse } from "@/types"

export const metadata = {
  title: "Schticks - Chi War",
}

export default async function SchticksPage({
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

  // Get default filter values for Schtick entity
  const defaults = getFilterDefaults("Schtick")

  return (
    <ResourcePage
      resourceName="schticks"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "Schtick")
        return client.getSchticks(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: SchticksResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        schticks: data.schticks,
        categories: data.categories,
        paths: data.paths,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          category: additionalParams?.category || defaults.category || "",
          path: additionalParams?.path || defaults.path || "",
          show_hidden: additionalParams?.show_hidden || defaults.show_hidden || false,
        },
        drawerOpen: false,
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
