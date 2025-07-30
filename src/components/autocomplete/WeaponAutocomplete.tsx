"use client"

import type { Weapon } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type WeaponsAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function WeaponsAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: WeaponsAutocompleteProperties) {
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
      const response = await client.getWeapons({ search: inputValue })
      return response.data.weapons.map((weapon: Weapon) => ({
        label: weapon.name || "",
        value: weapon.id || "",
      }))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      label="Weapon"
      value={value}
      fetchOptions={fetchOptions}
      onChange={onChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
