"use client"

import type { Vehicle, VehicleArchetype } from "@/types"
import { Autocomplete } from "@/components/ui"
import { useRef, useEffect, useState } from "react"
import { VS } from "@/services"
import { useClient } from "@/contexts"

type EditArchetypeProps = {
  vehicle: Vehicle
  updateEntity: (vehicle: Vehicle) => void
}

export default function EditArchetype({
  vehicle,
  updateEntity,
}: EditArchetypeProps) {
  const { client } = useClient()
  const [archetype, setArchetype] = useState(VS.archetype(vehicle))
  const [archetypes, setArchetypes] = useState<VehicleArchetype[]>([])
  const isMounted = useRef(false)

  const fetchRecords = async () => {
    const response = await client.getVehicleArchetypes()
    setArchetypes(response.data.archetypes || [])
  }

  useEffect(() => {
    if (!isMounted.current) {
      fetchRecords()
      isMounted.current = true
    }
  }, [isMounted, fetchRecords])

  // Sync local state with vehicle prop changes from WebSocket
  useEffect(() => {
    setArchetype(VS.archetype(vehicle))
  }, [vehicle])

  const fetchArchetypes = async (inputValue: string) => {
    return archetypes
      .filter(arch =>
        arch.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(arch => ({
        label: arch.name,
        value: arch.name,
      }))
  }

  const handleChange = async (value: string | null) => {
    if (!value) return

    setArchetype(value)

    const selectedArchetype = archetypes.find(arch => arch.name === value)
    let updatedVehicle = VS.updateActionValue(vehicle, "Archetype", value)
    updatedVehicle = VS.updateActionValue(
      updatedVehicle,
      "Acceleration",
      selectedArchetype?.Acceleration || 0
    )
    updatedVehicle = VS.updateActionValue(
      updatedVehicle,
      "Handling",
      selectedArchetype?.Handling || 0
    )
    updatedVehicle = VS.updateActionValue(
      updatedVehicle,
      "Squeal",
      selectedArchetype?.Squeal || 0
    )
    updatedVehicle = VS.updateActionValue(
      updatedVehicle,
      "Frame",
      selectedArchetype?.Frame || 0
    )
    updatedVehicle = VS.updateActionValue(
      updatedVehicle,
      "Crunch",
      selectedArchetype?.Crunch || 0
    )
    updateEntity(updatedVehicle)
  }

  return (
    <Autocomplete
      label="Archetype"
      freeSolo
      value={archetype || ""}
      fetchOptions={fetchArchetypes}
      onChange={handleChange}
      allowNone={false}
    />
  )
}
