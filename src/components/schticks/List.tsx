"use client"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box } from "@mui/material"
import { View, Menu } from "@/components/schticks"
import type { Schtick, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useLocalStorage, useCampaign, useClient } from "@/contexts"
import { queryParams } from "@/lib"
import { Icon, MainHeader } from "@/components/ui"

interface ListProperties {
  initialSchticks: Schtick[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
  initialIsMobile?: boolean
}

type ValidSort = "created_at" | "updated_at" | "name"
type ValidOrder = "asc" | "desc"
type FormStateData = {
  schticks: Schtick[]
  meta: PaginationMeta
  drawerOpen: boolean
  sort: string
  order: string
}

export default function List({
  initialFormData,
  initialIsMobile,
}: ListProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { saveLocally } = useLocalStorage()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    initialIsMobile ? "mobile" : "table"
  )
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  const { sort, order, schticks, drawerOpen } = formState.data
  const router = useRouter()

  useEffect(() => {
    saveLocally("schtickViewMode", viewMode)
  }, [viewMode, saveLocally])

  const validSorts: readonly ValidSort[] = useMemo(
    () => ["created_at", "updated_at", "name"],
    []
  )
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchSchticks = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc"
    ) => {
      try {
        const response = await client.getSchticks({ page, sort, order })
        console.log("Fetched schticks:", response.data.schticks)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "schticks",
          value: response.data.schticks,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta || { current_page: page, total_pages: 1 },
        })
        dispatchForm({ type: FormActions.ERROR, payload: null })
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unable to fetch schticks data"
        dispatchForm({ type: FormActions.ERROR, payload: errorMessage })
        console.error("Fetch schticks error:", error)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.schticks === "reload") {
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
      fetchSchticks(page, currentSort, currentOrder)
    }
  }, [
    client,
    campaignData,
    dispatchForm,
    fetchSchticks,
    validSorts,
    validOrders,
  ])

  useEffect(() => {
    const url = `/schticks?${queryParams({
      page: 1,
      sort,
      order,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchSchticks(1, sort, order)
  }, [fetchSchticks, order, router, sort])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSave = async (newSchtick: Schtick) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "schticks",
      value: [newSchtick, ...schticks],
    })
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
        <MainHeader
          title="Schticks"
          icon={<Icon keyword="Schticks" size="36" />}
        />
      </Box>
      <View
        viewMode={viewMode}
        formState={formState}
        dispatchForm={dispatchForm}
        initialIsMobile={initialIsMobile}
      />
    </>
  )
}
