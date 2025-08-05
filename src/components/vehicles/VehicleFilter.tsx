"use client"

import { Stack, Box } from "@mui/material"
import { FormActions, useForm } from "@/reducers"
import { useClient } from "@/contexts"
import {
  FactionAutocomplete,
  VehicleAutocomplete,
} from "@/components/autocomplete"
import { Autocomplete } from "@/components/ui"
import type { Vehicle, Faction } from "@/types"
import { useCallback, useEffect } from "react"

type FormStateData = {
  vehicle_type: string | null
  archetypes: string[]
  archetype: string | null
  vehicles: Vehicle[]
  vehicle_id: string | null
  factions: Faction[]
  faction_id: string | null
}

type VehicleFilterProps = {
  setEntity: (vehicle: Vehicle) => void
  dispatch: React.Dispatch<FormStateData>
  includeTypes?: boolean
  includeArchetypes?: boolean
  includeVehicles?: boolean
  includeArchetypes?: boolean
}

export default function VehicleFilter({
  setEntity,
  dispatch,
  includeVehicles = true,
  includeTypes = true,
  includeArchetypes = true,
  includeFactions = true,
}: VehicleFilterProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    vehicle_type: null,
    archetypes: [],
    archetype: null,
    vehicle_id: null,
    vehicles: [],
    factions: [],
  })
  const {
    vehicle_type,
    archetypes,
    archetype,
    vehicles,
    vehicle_id,
    factions,
    faction_id,
  } = formState.data

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await client.getVehicles({
        faction_id,
        type: vehicle_type,
        archetype: archetype,
        per_page: 100,
        sort: "name",
        order: "asc",
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "vehicles",
        value: response.data.vehicles || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "archetypes",
        value: response.data.archetypes || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "factions",
        value: response.data.factions || [],
      })
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      return []
    }
  }, [client, faction_id, vehicle_type, archetype, dispatchForm])

  useEffect(() => {
    if (!dispatch) return
    // update the set of vehicles outside the component
    dispatch({
      type: FormActions.UPDATE,
      name: "vehicle_type",
      value: vehicle_type,
    })
    dispatch({ type: FormActions.UPDATE, name: "archetype", value: archetype })
    dispatch({
      type: FormActions.UPDATE,
      name: "faction_id",
      value: faction_id,
    })
  }, [vehicle_type, faction_id, archetype, dispatch])

  useEffect(() => {
    fetchVehicleTypes()
  }, [])

  useEffect(() => {
    fetchVehicles()
      .catch(error => {
        console.error("Error in useEffect fetchVehicles:", error)
      })
      .then(() => {
        dispatchForm({
          type: FormActions.EDIT,
          name: "loading",
          value: false,
        })
      })
  }, [
    client,
    dispatchForm,
    vehicle_type,
    vehicle_id,
    faction_id,
    fetchVehicles,
  ])

  const handleVehicleChange = (vehicle: Vehicle | null) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "vehicle_id",
      value: vehicle.id,
    })
    setEntity(vehicle)
  }

  const handleFactionChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "faction_id", value })
  }

  const handleArchetypeChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "archetype", value })
  }

  const handleTypeChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "vehicle_type", value })
  }

  const fetchArchetypes = async () => {
    const opts = archetypes.map(archetype => ({
      label: archetype,
      value: archetype,
    }))
    return Promise.resolve(opts)
  }

  const fetchVehicleTypes = async () => {
    const vehicleTypes = [
      "Ally",
      "PC",
      "Mook",
      "Featured Foe",
      "Boss",
      "Uber-Boss",
    ].map(type => ({
      label: type,
      value: type,
    }))
    return Promise.resolve(vehicleTypes)
  }

  return (
    <Box
      sx={{
        mb: 2,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ width: "100%" }}
      >
        {includeTypes && (
          <Autocomplete
            label="Type"
            value={vehicle_type || ""}
            fetchOptions={fetchVehicleTypes}
            onChange={handleTypeChange}
            allowNone={false}
          />
        )}
        {includeArchetypes && (
          <Autocomplete
            label="Archetype"
            value={archetype || ""}
            fetchOptions={fetchArchetypes}
            onChange={handleArchetypeChange}
            allowNone={false}
          />
        )}
        {includeFactions && (
          <FactionAutocomplete
            options={factions.map(faction => ({
              label: faction.name || "",
              value: faction.id || "",
            }))}
            value={faction_id || ""}
            onChange={handleFactionChange}
            allowNone={false}
          />
        )}
        {includeVehicles && (
          <VehicleAutocomplete
            options={vehicles.map(vehicle => ({
              label: vehicle.name || "",
              value: vehicle.id || "",
            }))}
            value={vehicle_id || ""}
            onChange={handleVehicleChange}
            allowNone={false}
          />
        )}
      </Stack>
    </Box>
  )
}
