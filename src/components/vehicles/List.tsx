"use client"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useState } from "react"
import { Box } from "@mui/material"
import type { Vehicle, Faction, PaginationMeta } from "@/types"
import { useCampaign, useClient, useLocalStorage } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import { Icon, MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import { View, Menu } from "@/components/vehicles"

interface ListProps {
  initialFormData: FormStateData
  initialIsMobile: boolean
}

export type FormStateData = {
  vehicles: Vehicle[]
  factions: Faction[]
  archetypes: string[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    vehicle_type: string
    archetype: string
    faction_id: string
    page: number
    search: string
  }
}

export default function List({ initialFormData, initialIsMobile }: ListProps) {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const { saveLocally } = useLocalStorage()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "mobile">(
    initialIsMobile ? "mobile" : "table"
  )
  const { formState, dispatchForm } = useForm<FormStateData>(initialFormData)
  const { filters } = formState.data

  const fetchVehicles = useCallback(
    async filters => {
      try {
        const response = await client.getVehicles(filters)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "vehicles",
          value: response.data.vehicles,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "types",
          value: response.data.types,
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "archetypes",
          value: response.data.archetypes,
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

  // Subscribe to vehicle updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("vehicles", (data) => {
      if (data === "reload") {
        fetchVehicles(filters)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchVehicles, filters])

  useEffect(() => {
    const url = `/vehicles?${queryParams(filters)}`
    router.push(url, {
      scroll: false,
    })
    fetchVehicles(filters)
  }, [filters, fetchVehicles, router])

  useEffect(() => {
    saveLocally("vehicleViewMode", viewMode)
  }, [viewMode, saveLocally])

  return (
    <>
      <Menu viewMode={viewMode} setViewMode={setViewMode} />
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
