"use client"

import type { Faction } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type FactionsAutocompleteProps = {
  value: string
  onChange: (value: string | null) => Promise<void>
  options?: Option[]
}

export default function FactionsAutocomplete({ value, onChange, options }: FactionsAutocompleteProps) {
  const { client } = useClient()

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) return Promise.resolve(options)
    try {
      const response = await client.getFactions({ search: inputValue })
      return response.data.factions.map((faction: Faction) => ({
        label: faction.name || "",
        value: faction.id || ""
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
    />
  )

}
