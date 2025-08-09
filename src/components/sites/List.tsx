"use client"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box } from "@mui/material"
import { View, Menu } from "@/components/sites"
import type { Site, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useLocalStorage, useCampaign, useClient } from "@/contexts"
import { queryParams } from "@/lib"
import { Icon, MainHeader } from "@/components/ui"

interface ListProps {
  initialSites: Site[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
  initialIsMobile?: boolean
}

type ValidSort = "created_at" | "updated_at" | "name"
type ValidOrder = "asc" | "desc"
type FormStateData = {
  sites: Site[]
  meta: PaginationMeta
  drawerOpen: boolean
  sort: string
  order: string
}

export default function List({
  initialSites,
  initialMeta,
  initialSort,
  initialOrder,
  initialIsMobile,
}: ListProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { getLocally, saveLocally } = useLocalStorage()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    (getLocally("siteViewMode") as "table" | "mobile") ||
      (initialIsMobile ? "mobile" : "table")
  )
  const { formState, dispatchForm } = useForm<FormStateData>({
    sites: initialSites,
    meta: initialMeta,
    drawerOpen: false,
    sort: initialSort,
    order: initialOrder,
  })
  const { meta, sort, order, sites, drawerOpen } = formState.data
  const router = useRouter()

  useEffect(() => {
    saveLocally("siteViewMode", viewMode)
  }, [viewMode, saveLocally])

  const validSorts: readonly ValidSort[] = useMemo(
    () => ["created_at", "updated_at", "name"],
    []
  )
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchSites = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc"
    ) => {
      try {
        const response = await client.getSites({ page, sort, order })
        console.log("Fetched sites:", response.data.sites)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "sites",
          value: response.data.sites,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta || { current_page: page, total_pages: 1 },
        })
        dispatchForm({ type: FormActions.ERROR, payload: null })
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to fetch sites data"
        dispatchForm({ type: FormActions.ERROR, payload: errorMessage })
        console.error("Fetch sites error:", error)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.sites === "reload") {
      const parameters = new URLSearchParams(globalThis.location.search)
      const page = parameters.get("page")
        ? Number.parseInt(parameters.get("page")!, 10)
        : 1
      const sortParameter = parameters.get("sort")
      const orderParameter = parameters.get("order")
      const currentSort =
        sortParameter && validSorts.includes(sortParameter as ValidSort)
          ? sortParameter
          : "created_at"
      const currentOrder =
        orderParameter && validOrders.includes(orderParameter as ValidOrder)
          ? orderParameter
          : "desc"
      dispatchForm({
        type: FormActions.UPDATE,
        name: "sort",
        value: currentSort,
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "order",
        value: currentOrder,
      })
      fetchSites(page, currentSort, currentOrder)
    }
  }, [client, campaignData, dispatchForm, fetchSites, validSorts, validOrders])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSave = async (newSite: Site) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "sites",
      value: [newSite, ...sites],
    })
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
    router.push(`/sites?page=1&sort=${sort}&order=${newOrder}`, {
      scroll: false,
    })
    await fetchSites(1, sort, newOrder)
  }

  const handlePageChange = async (page: number) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/sites?page=1&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchSites(1, sort, order)
    } else {
      router.push(`/sites?page=${page}&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchSites(page, sort, order)
    }
  }

  const handleSortChange = (newSort: ValidSort) => {
    const newOrder = sort === newSort && order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "sort", value: newSort })
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
    const url = `/sites?${queryParams({
      page: 1,
      sort: newSort,
      order: newOrder,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchSites(1, newSort, newOrder)
  }

  return (
    <>
      <Menu
        viewMode={viewMode}
        setViewMode={setViewMode}
        drawerOpen={drawerOpen}
        handleOpenCreateDrawer={handleOpenCreateDrawer}
        handleCloseCreateDrawer={handleCloseCreateDrawer}
        handleSave={handleSave}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <MainHeader title="Sites" icon={<Icon keyword="Sites" size="36" />} />
      </Box>
      <View
        viewMode={viewMode}
        formState={formState}
        dispatchForm={dispatchForm}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onOrderChange={handleOrderChange}
        initialIsMobile={initialIsMobile}
      />
    </>
  )
}
