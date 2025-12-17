"use client"

import type { Juncture } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"

type JuncturesAutocompleteProperties = {
  value: string
  onChange: (juncture: Juncture | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function JuncturesAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: JuncturesAutocompleteProperties) {
  const { client } = useClient()
  const [junctures, setJunctures] = useState<Juncture[]>([])

  useEffect(() => {
    const fetchJunctures = async () => {
      try {
        const response = await client.getJunctures({
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setJunctures(response.data.junctures || [])
      } catch (error) {
        console.error("Error fetching junctures:", error)
      }
    }

    fetchJunctures().catch(error => {
      console.error("Error in useEffect fetchJunctures:", error)
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
    return junctures
      .filter(juncture =>
        juncture.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(juncture => ({
        label: juncture.name,
        value: juncture.id,
      }))
  }

  const handleChange = (selectedId: string | null) => {
    if (!selectedId) {
      onChange(null)
      return
    }
    const juncture = junctures.find(j => j.id === selectedId)
    onChange(juncture || null)
  }

  return (
    <Autocomplete
      label="Juncture"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
