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
        .filter(loc => !exclude.includes(loc.id || ""))
        .map(loc => ({
          label: loc.name,
          value: loc.id || "",
        }))

      // If allowCreate is true and there's input that doesn't match any existing location,
      // add an option to create a new one
      if (
        allowCreate &&
        inputValue.trim() &&
        !filtered.some(
          opt => opt.label.toLowerCase() === inputValue.toLowerCase()
        )
      ) {
        filtered.push({
          label: `Create "${inputValue.trim()}"`,
          value: `__create__:${inputValue.trim()}`,
        })
      }

      return filtered
    },
    [locations, options, exclude, allowCreate]
  )

  const handleChange = useCallback(
    (newValue: string | null) => {
      // Check if this is a "create new" option
      if (newValue?.startsWith("__create__:")) {
        const newName = newValue.replace("__create__:", "")
        // Return the name instead of ID so the parent can handle creation
        onChange(newName)
      } else {
        onChange(newValue)
      }
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
    />
  )
}
