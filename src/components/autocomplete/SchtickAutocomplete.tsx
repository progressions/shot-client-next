"use client"

import type { Schtick } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"

interface SchticksAutocompleteProperties {
  value: string | null // Updated to match Autocomplete's prop
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function SchticksAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: SchticksAutocompleteProperties) {
  const { client } = useClient()
  const [schticks, setSchticks] = useState<Schtick[]>([])

  useEffect(() => {
    const fetchSchticks = async () => {
      try {
        const response = await client.getSchticks({
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setSchticks(response.data.schticks || [])
      } catch (error) {
        console.error("Error fetching schticks:", error)
      }
    }
    fetchSchticks().catch(error => {
      console.error("Error in useEffect fetchSchticks:", error)
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
    return schticks
      .filter(schtick =>
        schtick.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(schtick => ({
        label: `${schtick.name} (${schtick.category})`, // Include category in label
        value: schtick.id.toString(), // Ensure value is string and unique
        key: schtick.id.toString(), // Explicit key for uniqueness
      }))
  }

  const handleChange = (selectedOption: Option | null) => {
    const schtick = schticks.find(s => s.id === selectedOption)
    onChange(schtick)
  }

  return (
    <Autocomplete
      label="Schtick"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
