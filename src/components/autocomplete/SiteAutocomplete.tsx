"use client"

import type { Site } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type SitesAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function SitesAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: SitesAutocompleteProperties) {
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
      const response = await client.getSites({ search: inputValue })
      return response.data.sites.map((site: Site) => ({
        label: site.name || "",
        value: site.id || "",
      }))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      label="Site"
      value={value}
      fetchOptions={fetchOptions}
      onChange={onChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
