"use client"

import type { Party } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"

type PartyAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function PartyAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: PartyAutocompleteProperties) {
  const { client } = useClient()
  const [parties, setParties] = useState<Party[]>([])

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await client.getParties({
          per_page: 100,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setParties(response.data.parties || [])
      } catch (error) {
        console.error("Error fetching parties:", error)
      }
    }
    fetchParties().catch(error => {
      console.error("Error in useEffect fetchParties:", error)
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
    return parties.map(party => ({
      label: party.name,
      value: party.id,
    }))
  }

  const handleChange = (selectedOption: Option | null) => {
    const party = parties.find(s => s.id === selectedOption)
    onChange(party)
  }

  return (
    <Autocomplete
      label="Party"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
