"use client"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box } from "@mui/material"
import { View, Menu } from "@/components/weapons"
import type { Weapon, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useLocalStorage, useCampaign, useClient } from "@/contexts"
import { queryParams } from "@/lib"
import { Icon, MainHeader } from "@/components/ui"

interface List {
  initialIsMobile?: boolean
}

type ValidSort = "created_at" | "updated_at" | "name"
type ValidOrder = "asc" | "desc"
type FormStateData = {
  weapons: Weapon[]
  category: string | null
  juncture: string | null
  meta: PaginationMeta
  drawerOpen: boolean
  sort: string
  order: string
}

export default function List({ initialFormData, initialIsMobile }: List) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { getLocally, saveLocally } = useLocalStorage()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(initialIsMobile ? "mobile" : "table")
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  const { sort, order, weapons, category, juncture, drawerOpen } =
    formState.data
  const router = useRouter()

  useEffect(() => {
    saveLocally("weaponViewMode", viewMode)
  }, [viewMode, saveLocally])

  const validSorts: readonly ValidSort[] = useMemo(
    () => ["created_at", "updated_at", "name"],
    []
  )
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchWeapons = useCallback(
    async (
      page: number = 1,
      sort: string = "created_at",
      order: string = "desc",
      category: string | null = null,
      juncture: string | null = null
    ) => {
      try {
        const response = await client.getWeapons({
          page,
          sort,
          order,
          category,
          juncture,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "weapons",
          value: response.data.weapons,
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
            : "Unable to fetch weapons data"
        dispatchForm({ type: FormActions.ERROR, payload: errorMessage })
        console.error("Fetch weapons error:", error)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.weapons === "reload") {
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
      fetchWeapons(page, currentSort, currentOrder, category, juncture)
    }
  }, [
    client,
    campaignData,
    dispatchForm,
    fetchWeapons,
    validSorts,
    validOrders,
    category,
    juncture,
  ])

  useEffect(() => {
    const url = `/weapons?${queryParams({
      page: 1,
      sort,
      order,
      category,
      juncture,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchWeapons(1, sort, order, category, juncture)
  }, [fetchWeapons, category, juncture, order, router, sort])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSave = async (newWeapon: Weapon) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "weapons",
      value: [newWeapon, ...weapons],
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
          title="Weapons"
          icon={<Icon keyword="Weapons" size="36" />}
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
