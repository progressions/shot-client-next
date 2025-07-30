"use client"

import type { Character } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type CharacterAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function CharacterAutocomplete({
  options,
  value,
  exclude = [],
  allowNone = true,
  onChange,
}: CharacterAutocompleteProperties) {
  const { client } = useClient()

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      )

      return filteredOptions
    }
    try {
      const response = await client.getCharacters({
        search: inputValue,
        per_page: 120,
        sort: "name",
        order: "asc",
      })
      return response.data.characters
        .map((character: Character) => ({
          label: character.name || "",
          value: character.id || "",
        }))
        .filter(option => !exclude.includes(option.value))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Autocomplete
      value={value}
      label="Character"
      fetchOptions={fetchOptions}
      onChange={onChange}
      allowNone={allowNone}
      exclude={exclude}
    />
  )
}
