"use client"

import type { Faction } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type FactionAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function FactionAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: FactionAutocompleteProperties) {
  const { client } = useClient()

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )

      return filteredOptions
    }
    try {
      const response = await client.getFactions({ search: inputValue })
      return response.data.factions.map((faction: Faction) => ({
        label: faction.name || "",
        value: faction.id || "",
      }))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      label="Faction"
      value={value}
      fetchOptions={fetchOptions}
      onChange={onChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
