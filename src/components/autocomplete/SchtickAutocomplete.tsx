"use client"

import type { Schtick } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type SchticksAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function SchticksAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: SchticksAutocompleteProperties) {
  const { client } = useClient()

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options
        .filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        .filter(option => !exclude.includes(option.value))

      return filteredOptions
    }
    try {
      const response = await client.getSchticks({ search: inputValue })
      return response.data.schticks.map((schtick: Schtick) => ({
        label: schtick.name || "",
        value: schtick.id || "",
      }))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      label="Schtick"
      value={value}
      fetchOptions={fetchOptions}
      onChange={onChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
