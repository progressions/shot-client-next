"use client"

import type { Party } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type PartyAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function PartyAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: PartyAutocompleteProperties) {
  const { client } = useClient()

  console.log("exclude:", exclude)

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )

      return filteredOptions
    }
    try {
      const response = await client.getParties({ search: inputValue })
      return response.data.parties
        .map((party: Party) => ({
          label: party.name || "",
          value: party.id || "",
        }))
        .filter(option => !exclude.includes(option.value))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      label="Party"
      value={value}
      fetchOptions={fetchOptions}
      onChange={onChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
