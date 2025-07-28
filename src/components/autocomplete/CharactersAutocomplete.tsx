"use client"

import type { Character } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"

type CharactersAutocompleteProps = {
  value: string
  onChange: (value: string | null) => void
}

export default function CharactersAutocomplete({ value, onChange }: CharactersAutocompleteProps) {
  const { client } = useClient()

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    try {
      const response = await client.getCharacters({ search: inputValue })
      return response.data.characters.map((character: Character) => ({
        label: character.name || "",
        value: character.id || ""
      }))
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
    />
  )

}
