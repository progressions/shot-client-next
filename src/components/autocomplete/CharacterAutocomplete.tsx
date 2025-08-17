"use client"

import type { Character } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"

type CharactersAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function CharactersAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: CharactersAutocompleteProperties) {
  const { client } = useClient()
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await client.getCharacters({
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setCharacters(response.data.characters || [])
      } catch (error) {
        console.error("Error fetching characters:", error)
      }
    }

    fetchCharacters().catch(error => {
      console.error("Error in useEffect fetchCharacters:", error)
    })
  }, [client])

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    if (options) {
      const filteredOptions = options
        .filter(option =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        .filter(option => !exclude.includes(option.value))

      return filteredOptions
    }
    return characters
      .filter(character =>
        character.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(character => ({
        label: character.name,
        value: character.id,
      }))
  }

  const handleChange = (selectedOption: Option | null) => {
    const character = characters.find(s => s.id === selectedOption)
    onChange(character)
  }

  return (
    <Autocomplete
      label="Character"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
