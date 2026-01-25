"use client"

import type { Location } from "@/types"
import { type Option, Autocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useEffect, useCallback } from "react"

type LocationAutocompleteProperties = {
  /** The fight ID to fetch locations for */
  fightId: string
  /** Current location value (ID or name) */
  value: string
  /** Callback when location changes */
  onChange: (value: string | null) => void
  /** Pre-provided options (overrides fetch) */
  options?: Option[]
  /** Location IDs to exclude from options */
  exclude?: string[]
  /** Allow "None" option */
  allowNone?: boolean
  /** Allow creating new locations by typing */
  allowCreate?: boolean
  /** Label for the autocomplete field */
  label?: string
}

export default function LocationAutocomplete({
  fightId,
  value,
  onChange,
  options,
  exclude = [],
  allowNone = true,
  allowCreate = true,
  label = "Location",
}: LocationAutocompleteProperties) {
  const { client } = useClient()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!fightId) return

    const fetchLocations = async () => {
      setLoading(true)
      try {
        const response = await client.getFightLocations(fightId, {
          per_page: 200,
          page: 1,
          sort: "name",
          order: "asc",
        })
        setLocations(response.data.locations || [])
      } catch (error) {
        console.error("Error fetching locations:", error)
        setLocations([])
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [client, fightId])

  const fetchOptions = useCallback(
    async (inputValue: string): Promise<Option[]> => {
      if (options) {
        const filteredOptions = options
          .filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
          )
          .filter(option => !exclude.includes(option.value))

        return filteredOptions
      }

      const filtered = locations
        .filter(loc =>
          loc.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map(loc => ({
          label: loc.name,
          // Use the name as the value since the API expects a location name
          // The backend will find-or-create the Location by name
          value: loc.name,
        }))

      return filtered
    },
    [locations, options, exclude]
  )

  const handleChange = useCallback(
    (newValue: string | null) => {
      // Pass through the location name directly
      // The API will find-or-create the Location by name
      onChange(newValue)
    },
    [onChange]
  )

  return (
    <Autocomplete
      label={label}
      value={value}
      fetchOptions={fetchOptions}
      onChange={handleChange}
      exclude={exclude}
      allowNone={allowNone}
      loading={loading}
      freeSolo={allowCreate}
    />
  )
}
