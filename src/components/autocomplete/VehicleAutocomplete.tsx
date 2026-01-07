"use client"

import type { Vehicle } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useEffect, useState } from "react"

type VehicleAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function VehicleAutocomplete({
  options,
  value,
  exclude = [],
  onChange,
  allowNone = true,
}: VehicleAutocompleteProperties) {
  const { client } = useClient()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await client.getVehicles({
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setVehicles(response.data.vehicles || [])
      } catch (error) {
        console.error("Error fetching vehicles:", error)
      }
    }

    fetchVehicles()
  }, [client])

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options
        .filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        .filter(option => !exclude.includes(option.value))

      return filteredOptions
    }
    return vehicles
      .filter(vehicle =>
        vehicle.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(vehicle => ({
        label: vehicle.name,
        value: vehicle.id,
      }))
  }

  const handleChange = (value: string | null) => {
    onChange(value)
  }

  return (
    <Autocomplete
      label="Vehicle"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
