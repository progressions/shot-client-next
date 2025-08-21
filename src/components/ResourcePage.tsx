import { Suspense } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Box } from "@mui/material"
import { getServerClient, getPageParameters } from "@/lib"
import Breadcrumbs from "@/components/Breadcrumbs"
import { ListPageSkeleton } from "@/components/ui/skeletons"
import { User } from "@/types"

interface ResourcePageProps<T> {
  resourceName: string
  fetchData: (
    client: ReturnType<typeof getServerClient>,
    params: { page: number; sort: string; order: string }
  ) => Promise<{ data: T }>
  validSorts: string[]
  getInitialFormData: (
    data: T,
    page: number,
    sort: string,
    order: string,
    search?: string
  ) => object
  ListComponent: React.ComponentType<{
    initialFormData: object
    initialIsMobile: boolean
  }>
  user: User | null
}

export default async function ResourcePage<T>({
  resourceName,
  fetchData,
  validSorts,
  getInitialFormData,
  ListComponent,
  searchParams,
  user: _user,
}: ResourcePageProps<T> & {
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>
}) {
  const client = await getServerClient()
  // Validate parameters with fixed defaults
  const { page, sort, order, search } = await getPageParameters(searchParams, {
    validSorts,
    defaultSort: "created_at",
    defaultOrder: "desc",
  })
  // Redirect if page is invalid
  if (page <= 0) {
    redirect(
      `/${resourceName}?page=1&sort=created_at&order=desc&search=${search}`
    )
  }
  // Fetch data
  const response = await fetchData(client, { page, sort, order, search })
  const data = response.data
  // Detect mobile device
  const headersState = await headers()
  const userAgent = headersState.get("user-agent") || ""
  const initialIsMobile = /mobile/i.test(userAgent)
  // Prepare initial form data
  const initialFormData = getInitialFormData(data, page, sort, order, search)
  return (
    <Box
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        position: "relative",
      }}
    >
      <Suspense fallback={<ListPageSkeleton entityType={resourceName} />}>
        <Breadcrumbs client={client} />
      </Suspense>
      <Suspense fallback={
        <ListPageSkeleton 
          entityType={resourceName}
          viewMode={initialIsMobile ? "mobile" : "table"}
          showSearch={true}
          showFilters={true}
          itemCount={8}
        />
      }>
        <ListComponent
          initialFormData={initialFormData}
          initialIsMobile={initialIsMobile}
        />
      </Suspense>
    </Box>
  )
}
