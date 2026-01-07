"use client"

import type { Site } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect } from "react"

type SitesAutocompleteProperties = {
  value: string
  onChange: (value: string | null) => void
  options?: Option[]
  exclude?: string[]
  allowNone?: boolean
}

export default function SitesAutocomplete({
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
}: SitesAutocompleteProperties) {
  const { client } = useClient()
  const [sites, setSites] = useState<Site[]>([])

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await client.getSites({
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setSites(response.data.sites || [])
      } catch (error) {
        console.error("Error fetching sites:", error)
      }
    }

    fetchSites()
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
    return sites
      .filter(site =>
        site.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .map(site => ({
        label: site.name,
        value: site.id,
      }))
  }

  const handleChange = (value: string | null) => {
    onChange(value)
  }

  return (
    <Autocomplete
      label="Site"
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
    />
  )
}
