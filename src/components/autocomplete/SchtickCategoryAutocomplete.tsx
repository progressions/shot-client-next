"use client"

import type { SchtickCategory } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type SchtickCategoryAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function SchtickCategoryAutocomplete({
  value,
  onChange,
  options,
  allowNone = true,
  exclude = [],
}: SchtickCategoryAutocompleteProperties) {
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
      const response = await client.getSchtickCategories({ search: inputValue })
      return response.data.categories.map((category: SchtickCategory) => ({
        label: category || "",
        value: category || "",
      }))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      label="Category"
      value={value}
      fetchOptions={fetchOptions}
      onChange={onChange}
      allowNone={allowNone}
      exclude={exclude}
    />
  )
}
