"use client"

import type { JunctureName } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type WeaponJunctureAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
  disabled?: boolean
}

export default function WeaponJunctureAutocomplete({
  value,
  onChange,
  options,
  allowNone = true,
  exclude = [],
  disabled = false,
}: WeaponJunctureAutocompleteProperties) {
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
      const response = await client.getWeaponJunctures({ search: inputValue })
      return response.data.junctures.map((juncture: JunctureName) => ({
        label: juncture || "",
        value: juncture || "",
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
      allowNone={allowNone}
      exclude={exclude}
      disabled={disabled}
    />
  )
}
