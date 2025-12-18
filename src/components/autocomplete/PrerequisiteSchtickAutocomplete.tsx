"use client"

import type { Schtick } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"

interface PrerequisiteSchtickAutocompleteProperties {
  value: string | null
  onChange: (prerequisiteId: string | null) => void
  category?: string
  path?: string
  exclude?: string[]
}

export default function PrerequisiteSchtickAutocomplete({
  value,
  onChange,
  category,
  path,
  exclude = [],
}: PrerequisiteSchtickAutocompleteProperties) {
  const { client } = useClient()
  const [schticks, setSchticks] = useState<Schtick[]>([])

  useEffect(() => {
    const fetchSchticks = async () => {
      try {
        const params: Record<string, unknown> = {
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
        }

        // Filter by category and path if provided
        if (category) {
          params.category = category
        }
        if (path) {
          params.path = path
        }

        const response = await client.getSchticks(params)
        setSchticks(response.data.schticks || [])
      } catch (error) {
        console.error("Error fetching schticks:", error)
      }
    }
    fetchSchticks().catch(error => {
      console.error("Error in useEffect fetchSchticks:", error)
    })
  }, [client, category, path])

  const fetchOptions = async (inputValue: string): Promise<Option[]> => {
    return schticks
      .filter(schtick =>
        schtick.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .filter(schtick => !exclude.includes(schtick.id))
      .map(schtick => ({
        label: `${schtick.name}${schtick.category ? ` (${schtick.category})` : ""}`,
        value: schtick.id,
      }))
  }

  const handleChange = (selectedId: string | null) => {
    onChange(selectedId)
  }

  return (
    <Autocomplete
      label="Prerequisite"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={true}
      sx={{
        "& .MuiInputBase-root": {
          backgroundColor: "transparent",
        },
      }}
    />
  )
}
