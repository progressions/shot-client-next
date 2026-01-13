// app/users/page.tsx
import { List } from "@/components/users"
import ResourcePage from "@/components/ResourcePage"
import { applyFilterDefaults } from "@/lib"
import type { UsersResponse } from "@/types"

export const metadata = {
  title: "Users - Chi War",
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    sort?: string
    order?: string
    search?: string
    at_a_glance?: string
  }>
}) {
  return (
    <ResourcePage
      resourceName="users"
      fetchData={async (client, params) => {
        // Apply default filters to params before API call
        const paramsWithDefaults = applyFilterDefaults(params, "User")
        return client.getUsers(paramsWithDefaults)
      }}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(
        data: UsersResponse,
        page,
        sort,
        order,
        search,
        additionalParams
      ) => ({
        users: data.users,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
          at_a_glance:
            additionalParams?.at_a_glance || defaults.at_a_glance || false,
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
