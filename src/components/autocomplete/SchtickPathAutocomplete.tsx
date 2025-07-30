"use client"

import type { SchtickPath } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type SchtickPathAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  fetchOptions?: (inputValue: string) => Promise<Option[]>
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function SchtickPathAutocomplete({
  value,
  fetchOptions,
  onChange,
  options,
  allowNone = true,
  exclude = [],
}: SchtickPathAutocompleteProperties) {
  const { client } = useClient()

  const handleFetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options
        .filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        .filter(option => !exclude.includes(option.value))

      return filteredOptions
    }
    try {
      const response = await client.getSchtickPaths({ search: inputValue })
      return response.data.paths.map((path: SchtickPath) => ({
        label: path || "",
        value: path || "",
      }))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      label="Path"
      value={value}
      fetchOptions={fetchOptions || handleFetchOptions}
      onChange={onChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
