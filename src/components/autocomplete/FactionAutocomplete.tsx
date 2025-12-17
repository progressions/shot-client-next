"use client"

import type { Faction } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"

type FactionAutocompleteProperties = {
  value: string
  onChange: (faction: Faction | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function FactionAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: FactionAutocompleteProperties) {
  const { client } = useClient()
  const [factions, setFactions] = useState<Faction[]>([])

  useEffect(() => {
    const fetchFactions = async () => {
      try {
        const response = await client.getFactions({
          autocomplete: true,
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setFactions(response.data.factions || [])
      } catch (error) {
        console.error("Error fetching factions:", error)
      }
    }

    fetchFactions().catch(error => {
      console.error("Error in useEffect fetchFactions:", error)
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
    return factions
      .filter(faction =>
        faction.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(faction => ({
        label: faction.name,
        value: faction.id,
      }))
  }

  const handleChange = (selectedId: string | null) => {
    if (!selectedId) {
      onChange(null)
      return
    }
    const faction = factions.find(f => f.id === selectedId)
    onChange(faction || null)
  }

  return (
    <Autocomplete
      label="Faction"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
