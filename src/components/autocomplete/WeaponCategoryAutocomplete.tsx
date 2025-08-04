"use client"

import type { WeaponCategory } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type WeaponCategoryAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
  disabled?: boolean
}

export default function WeaponCategoryAutocomplete({
  value,
  onChange,
  options,
  allowNone = true,
  exclude = [],
  disabled = false,
}: WeaponCategoryAutocompleteProperties) {
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
      const response = await client.getWeaponCategories({ search: inputValue })
      return response.data.categories.map((category: WeaponCategory) => ({
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
      disabled={disabled}
    />
  )
}
