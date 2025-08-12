"use client"
import { useMemo, useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box } from "@mui/material"
import { View, Menu } from "@/components/vehicles"
import type { Vehicle, PaginationMeta } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"
import { queryParams } from "@/lib"
import { Icon, MainHeader } from "@/components/ui"

interface ListProps {
  initialVehicles: Vehicle[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
  initialIsMobile?: boolean
}

type FormStateData = {
  vehicles: Vehicle[]
  meta: PaginationMeta
  filters: {
    vehicle_type: string
    archetype: string
    faction_id: string
    sort: string
    order: string
    page: number
  }
  drawerOpen: boolean
}

export default function List({ initialFormData, initialIsMobile }: ListProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    initialIsMobile ? "mobile" : "table"
  )
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  const { filters, vehicles, drawerOpen } = formState.data
  const { page } = filters
  const router = useRouter()

  const validSorts: readonly ValidSort[] = useMemo(
    () => ["created_at", "updated_at", "name"],
    []
  )
  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchVehicles = useCallback(
    async filters => {
      try {
        const response = await client.getVehicles({ ...filters })
        console.log("Fetched vehicles:", response.data.vehicles)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "vehicles",
          value: response.data.vehicles,
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
            : "Unable to fetch vehicles data"
        dispatchForm({ type: FormActions.ERROR, payload: errorMessage })
        console.error("Fetch vehicles error:", error)
      }
    },
    [client, dispatchForm, page]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.vehicles === "reload") {
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
        name: "filters",
        value: {
          ...formState.data.filters,
          page: page,
          sort: currentSort,
          order: currentOrder,
        },
      })

      fetchVehicles(filters)
    }
  }, [
    filters,
    formState.data.filters,
    client,
    campaignData,
    dispatchForm,
    fetchVehicles,
    validSorts,
    validOrders,
  ])

  useEffect(() => {
    const url = `/vehicles?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchVehicles(filters)
  }, [fetchVehicles, router, filters])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSave = async (newVehicle: Vehicle) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "vehicles",
      value: [newVehicle, ...vehicles],
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
          title="Vehicles"
          icon={<Icon keyword="Vehicles" size="36" />}
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
