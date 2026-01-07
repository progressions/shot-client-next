"use client"

import type { Fight } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"

type FightAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function FightAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: FightAutocompleteProperties) {
  const { client } = useClient()
  const [fights, setFights] = useState<Fight[]>([])

  useEffect(() => {
    const fetchFights = async () => {
      try {
        const response = await client.getFights({
          per_page: 100,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setFights(response.data.fights || [])
      } catch (error) {
        console.error("Error fetching fights:", error)
      }
    }
    fetchFights()
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
    return fights
      .filter(fight =>
        fight.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(fight => ({
        label: fight.name,
        value: fight.id,
      }))
  }

  const handleChange = (value: string | null) => {
    onChange(value)
  }

  return (
    <Autocomplete
      label="Fight"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
