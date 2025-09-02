"use client"

import { Box } from "@mui/material"
import { FormActions, useForm } from "@/reducers"
import { useClient } from "@/contexts"
import { GenericFilter } from "@/components/ui/filters/GenericFilter"
import type { Vehicle, Faction } from "@/types"
import { useCallback, useEffect } from "react"

type FormStateData = {
  filters: Record<string, string | boolean | null>
  vehicles: Vehicle[]
  factions: Faction[]
  archetypes: string[]
  types: string[]
  selectedVehicle: Vehicle | null
}

type VehicleFilterProps = {
  value?: string | null
  setSelectedVehicle: (vehicle: Vehicle | null) => void
  addMember?: (vehicle: Vehicle) => void
  omit?: string[]
}

export default function VehicleFilter({
  value,
  setSelectedVehicle,
  addMember,
  omit = [],
}: VehicleFilterProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    filters: {
      type: null,
      archetype: null,
      faction_id: null,
      vehicle_id: null,
      search: "",
    },
    vehicles: [],
    factions: [],
    archetypes: [],
    types: [],
    selectedVehicle: null,
  })

  const fetchVehicles = useCallback(async () => {
    try {
      const { filters } = formState.data
      const response = await client.getVehicles({
        per_page: 200,
        page: 1,
        sort: "name",
        order: "asc",
        type: filters.type as string,
        archetype: filters.archetype as string,
        faction_id: filters.faction_id as string,
        search: filters.search as string,
      })

      dispatchForm({
        type: FormActions.UPDATE,
        name: "vehicles",
        value: response.data.vehicles || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "factions",
        value: response.data.factions || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "archetypes",
        value: response.data.archetypes || [],
      })
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    }
  }, [client, dispatchForm, formState.data.filters]) // Only depend on filters

  useEffect(() => {
    fetchVehicles().catch(error => {
      console.error("Error in useEffect fetchVehicles:", error)
    })
  }, [fetchVehicles])

  const handleVehicleChange = (vehicle: Vehicle | null) => {
    console.log("[VehicleFilter] handleVehicleChange called with:", vehicle)

    if (vehicle && addMember) {
      addMember(vehicle)
      // Clear the selection after adding
      dispatchForm({
        type: FormActions.UPDATE,
        name: "filters",
        value: {
          ...formState.data.filters,
          vehicle_id: null,
          vehicle: null,
        },
      })
    }
    setSelectedVehicle?.(vehicle)
  }

  const handleFiltersUpdate = (
    filters: Record<string, string | boolean | null>
  ) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "filters",
      value: filters,
    })
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <GenericFilter
        entity="Vehicle"
        formState={formState}
        onChange={handleVehicleChange}
        onFiltersUpdate={handleFiltersUpdate}
        omit={omit}
      />
    </Box>
  )
}
