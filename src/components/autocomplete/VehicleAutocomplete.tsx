"use client"

import type { Vehicle } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type VehicleAutocompleteProps = {
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
}: VehicleAutocompleteProps) {
  const { client } = useClient()

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options
        .filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        .filter(option => !exclude.includes(option.value))

      return filteredOptions;
    }
    try {
      const response = await client.getVehicles({
        search: inputValue,
        per_page: 120,
        sort: "name",
        order: "asc",
      })
      return response.data.vehicles
        .map((vehicle: Vehicle) => ({
          label: vehicle.name || "",
          value: vehicle.id || "",
        }))
        .filter(option => !exclude.includes(option.value))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      value={value}
      label="Vehicle"
      fetchOptions={fetchOptions}
      onChange={onChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
