"use client"

import type { Juncture } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type JuncturesAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function JuncturesAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: JuncturesAutocompleteProperties) {
  const { client } = useClient()

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )

      return filteredOptions
    }
    try {
      const response = await client.getJunctures({ search: inputValue })
      return response.data.junctures.map((juncture: Juncture) => ({
        label: juncture.name || "",
        value: juncture.id || "",
      }))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      label="Juncture"
      value={value}
      fetchOptions={fetchOptions}
      onChange={onChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
