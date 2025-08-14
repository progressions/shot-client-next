// app/users/page.tsx
import { List } from "@/components/users"
import ResourcePage from "@/components/ResourcePage"
import type { UsersResponse } from "@/types"

export const metadata = {
  title: "Users - Chi War",
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; order?: string, search?: string }>
}) {
  return (
    <ResourcePage
      resourceName="users"
      fetchData={async (client, params) => client.getUsers(params)}
      validSorts={["name", "created_at", "updated_at"]}
      getInitialFormData={(data: UsersResponse, page, sort, order, search) => ({
        users: data.users,
        meta: data.meta,
        filters: {
          sort,
          order,
          page,
          search,
        },
      })}
      ListComponent={List}
      searchParams={searchParams}
    />
  )
}
