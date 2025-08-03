"use client"
import { useRouter } from "next/navigation"
import { useMemo, useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Vehicle, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { HeroTitle } from "@/components/ui"
import { queryParams } from "@/lib"
import { VehiclesView, VehiclesMenu } from "@/components/vehicles"

interface VehiclesProperties {
  initialVehicles: Vehicle[]
  initialMeta: PaginationMeta
  initialSort: string
  initialOrder: string
  initialIsMobile: boolean
}

type ValidSort = "name" | "type" | "created_at" | "updated_at"
type ValidOrder = "asc" | "desc"

type FormStateData = {
  vehicles: Vehicle[]
  meta: PaginationMeta
  sort: string
  order: string
  vehicle_type: string
  archetype: string
  faction_id: string
}

export default function Vehicles({
  initialVehicles,
  initialMeta,
  initialSort,
  initialOrder,
  initialIsMobile,
}: VehiclesProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { saveLocally, getLocally } = useLocalStorage()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    (getLocally("vehicleViewMode") as "table" | "mobile") ||
      (initialIsMobile ? "mobile" : "table")
  )
  const { formState, dispatchForm } = useForm<FormStateData>({
    vehicles: initialVehicles,
    meta: initialMeta,
    sort: initialSort,
    order: initialOrder,
    vehicle_type: "",
    archetype: "",
    faction_id: "",
  })
  const { meta, sort, order, vehicle_type, archetype, faction_id } =
    formState.data

  const validOrders: readonly ValidOrder[] = useMemo(() => ["asc", "desc"], [])

  const fetchVehicles = useCallback(
    async (
      page: number = 1,
      sort: string = "name",
      order: string = "asc",
      vehicle_type: string = "",
      faction_id: string = "",
      archetype: string = ""
    ) => {
      try {
        const response = await client.getVehicles({
          archetype,
          page,
          sort,
          order,
          type: vehicle_type,
          faction_id,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "vehicles",
          value: response.data.vehicles,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "meta",
          value: response.data.meta,
        })
      } catch (error) {
        console.error("Fetch vehicles error:", error)
      }
    },
    [client, dispatchForm]
  )

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.vehicles === "reload") {
      fetchVehicles(
        meta.current_page,
        sort,
        order,
        vehicle_type,
        faction_id,
        archetype
      )
    }
  }, [
    client,
    campaignData,
    dispatchForm,
    fetchVehicles,
    validOrders,
    archetype,
    faction_id,
    vehicle_type,
    sort,
    order,
    meta.current_page,
  ])

  useEffect(() => {
    const url = `/vehicles?${queryParams({
      page: 1,
      sort,
      order,
      type: vehicle_type,
      faction_id,
      archetype,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchVehicles(1, sort, order, vehicle_type, faction_id, archetype)
  }, [vehicle_type, archetype, faction_id, fetchVehicles, order, router, sort])

  useEffect(() => {
    saveLocally("vehicleViewMode", viewMode)
  }, [viewMode, saveLocally])

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    if (page <= 0 || page > meta.total_pages) {
      const url = `/vehicles?${queryParams({
        page: 1,
        sort,
        order,
        type: vehicle_type,
        faction_id,
        archetype,
      })}`
      router.push(url, {
        scroll: false,
      })
      fetchVehicles(1, sort, order)
    } else {
      const url = `/vehicles?${queryParams({
        page,
        sort,
        order,
        type: vehicle_type,
        faction_id,
        archetype,
      })}`
      router.push(url, {
        scroll: false,
      })
      fetchVehicles(page, sort, order)
    }
  }

  const handleSortChange = (newSort: ValidSort) => {
    const newOrder = sort === newSort && order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "sort", value: newSort })
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
    const url = `/vehicles?${queryParams({
      page: 1,
      sort: newSort,
      order: newOrder,
      type: vehicle_type,
      faction_id,
      archetype,
    })}`
    router.push(url, {
      scroll: false,
    })
    fetchVehicles(1, newSort, newOrder)
  }

  return (
    <>
      <VehiclesMenu viewMode={viewMode} setViewMode={setViewMode} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <HeroTitle>Vehicles</HeroTitle>
      </Box>
      <VehiclesView
        viewMode={viewMode}
        formState={formState}
        dispatchForm={dispatchForm}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onOrderChange={() => handleSortChange(sort as ValidSort)}
        initialIsMobile={initialIsMobile}
      />
    </>
  )
}
