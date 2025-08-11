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

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile?: boolean
}

type ValidSort = "created_at" | "updated_at" | "name"
type ValidOrder = "asc" | "desc"
type FormStateData = {
  fights: Fight[]
  meta: PaginationMeta
  drawerOpen: boolean
  sort: string
  order: string
  page: number
}

export default function List({ initialFormData, initialIsMobile }: ListProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { getLocally } = useLocalStorage()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(initialIsMobile ? "mobile" : "table")
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  const { page, sort, order, fights, drawerOpen } = formState.data
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
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to fetch fights data"
        dispatchForm({ type: FormActions.ERROR, payload: errorMessage })
        console.error("Fetch fights error:", error)
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
      fetchFights(page, currentSort, currentOrder)
    }
  }, [client, campaignData, dispatchForm, fetchFights, validSorts, validOrders])

  // whenever page, sort, or order changes, update the URL and fetch fights
  useEffect(() => {
    const url = `/fights?${queryParams({
      page: page,
      sort,
      order,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchFights(page, sort, order)
  }, [fetchFights, order, router, sort, page])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSave = async (newFight: Fight) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "fights",
      value: [newFight, ...fights],
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
        <MainHeader title="Fights" icon={<Icon keyword="Fights" size="36" />} />
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
