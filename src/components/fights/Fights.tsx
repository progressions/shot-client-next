"use client"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box } from "@mui/material"
import { View, Menu } from "@/components/fights"
import type { Fight, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useLocalStorage, useCampaign, useClient } from "@/contexts"
import { queryParams } from "@/lib"
import { Icon, MainHeader } from "@/components/ui"

interface FightsProperties {
  initialFights: Fight[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
  initialIsMobile?: boolean
}

type ValidOrder = "asc" | "desc"

type FormStateData = {
  fights: Fight[]
  meta: PaginationMeta
  drawerOpen: boolean
  sort: string
  order: string
}

export default function Fights({
  initialFights,
  initialMeta,
  initialSort,
  initialOrder,
  initialIsMobile,
}: FightsProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { getLocally } = useLocalStorage()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    (getLocally("fightViewMode") as "table" | "mobile") ||
      (initialIsMobile ? "mobile" : "table")
  )
  const { formState, dispatchForm } = useForm<FormStateData>({
    fights: initialFights,
    meta: initialMeta,
    drawerOpen: false,
    sort: initialSort,
    order: initialOrder,
  })
  const { meta, sort, order, fights, drawerOpen } = formState.data
  const router = useRouter()

  const validSorts: readonly ValidSort[] = useMemo(
    () => ["created_at", "updated_at", "name"],
    []
  )
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchFights = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc"
    ) => {
      try {
        const response = await client.getFights({ page, sort, order })
        console.log("Fetched fights:", response.data.fights)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "fights",
          value: response.data.fights,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta || { current_page: page, total_pages: 1 },
        })
        dispatchForm({ type: FormActions.ERROR, payload: null })
      } catch (error_: unknown) {
        dispatchForm({
          type: FormActions.ERROR,
          payload:
            error_ instanceof Error ? error_.message : "Failed to fetch fights",
        })
        console.error("Fetch fights error:", error_)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.fights === "reload") {
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
      setSort(currentSort)
      setOrder(currentOrder)
      fetchFights(page, currentSort, currentOrder)
    }
  }, [client, campaignData, dispatchForm, fetchFights, validSorts, validOrders])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveFight = async (newFight: Fight) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "fights",
      value: [newFight, ...fights],
    })
  }

  const handleOrderChange = async () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    setOrder(newOrder)
    router.push(`/sites?page=1&sort=${sort}&order=${newOrder}`, {
      scroll: false,
    })
    await fetchSites(1, sort, newOrder, faction_id)
  }
  const handlePageChange = async (page: number) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`/fights?page=1&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchFights(1, sort, order)
    } else {
      router.push(`/fights?page=${page}&sort=${sort}&order=${order}`, {
        scroll: false,
      })
      await fetchFights(page, sort, order)
    }
  }

  const handleSortChange = (newSort: ValidSort) => {
    const newOrder = sort === newSort && order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "sort", value: newSort })
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
    const url = `/fights?${queryParams({
      page: 1,
      sort: newSort,
      order: newOrder,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchFights(1, newSort, newOrder)
  }

  return (
    <>
      <Menu
        viewMode={viewMode}
        setViewMode={setViewMode}
        drawerOpen={drawerOpen}
        handleOpenCreateDrawer={handleOpenCreateDrawer}
        handleCloseCreateDrawer={handleCloseCreateDrawer}
        handleSaveFight={handleSaveFight}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <MainHeader title="Fights" icon={<Icon keyword="Fights" size="36" />} />
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
