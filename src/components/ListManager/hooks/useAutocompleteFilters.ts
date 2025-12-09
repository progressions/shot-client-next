/**
 * useAutocompleteFilters Hook
 *
 * Manages filter state and data fetching for autocomplete dropdowns.
 * Integrates with the form reducer system to track filter changes and
 * fetch matching entities from the API.
 *
 * @module components/ListManager/hooks/useAutocompleteFilters
 */

import { useState, useEffect, useCallback, useMemo } from "react"
import { FormActions, useForm } from "@/reducers"

interface Client {
  [key: string]: (
    params: Record<string, unknown>
  ) => Promise<{ data: Record<string, unknown> }>
}

/**
 * Hook for managing autocomplete filter state and data fetching.
 *
 * Creates a form state for tracking filter values and automatically
 * fetches entities when filters change. Cleans filter values before
 * sending to API (removes object values, keeps primitives).
 *
 * @param pluralChildEntityName - Pluralized entity name for API method lookup
 * @param client - API client with dynamic get methods
 * @returns Object with formState, updateFilters callback, and loading state
 *
 * @example
 * ```tsx
 * const { formState, updateFilters, loading } = useAutocompleteFilters(
 *   "Characters",
 *   client
 * )
 *
 * // Update filters
 * updateFilters({ faction_id: 5, archetype: "Martial Artist" })
 *
 * // Access fetched data
 * const characters = formState.data.characters
 * ```
 */
export function useAutocompleteFilters(
  pluralChildEntityName: string,
  client: Client
) {
  const [loading, setLoading] = useState(true)
  const contextualFilters: Record<string, string> = useMemo(() => ({}), [])

  const { formState, dispatchForm } = useForm<{
    data: {
      filters: Record<string, string | boolean | null>
      [key: string]: unknown
    }
  }>({
    characters: [],
    factions: [],
    archetypes: [],
    types: [],
    filters: {
      ...contextualFilters,
      per_page: 200,
      sort: "name",
      order: "asc",
    },
  })
  const { filters } = formState.data

  useEffect(() => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "filters",
      value: {
        ...contextualFilters,
        sort: "name",
        order: "asc",
        per_page: 200,
      },
    })
  }, [contextualFilters, dispatchForm])

  const fetchChildrenForAutocomplete = useCallback(
    async (localFilters: Record<string, string | boolean | null>) => {
      try {
        const funcName = `get${pluralChildEntityName}`
        const getFunc = client[funcName]

        if (typeof getFunc !== "function") {
          console.error(`Function ${funcName} does not exist on client`)
          return
        }

        // Filter out object values (like faction: {...}) that shouldn't be sent to API
        // Only send primitive values (strings, numbers, booleans, null)
        const cleanedFilters = Object.fromEntries(
          Object.entries(localFilters).filter(([, value]) => {
            if (value === null || value === undefined) return true
            if (Array.isArray(value)) return true
            if (typeof value === "object") return false
            return true
          })
        )

        const apiParams = {
          ...contextualFilters,
          ...cleanedFilters,
        }

        const response = await getFunc(apiParams)

        for (const [key, value] of Object.entries(response.data)) {
          dispatchForm({
            type: FormActions.UPDATE,
            name: key,
            value: value,
          })
        }
      } catch (error) {
        console.error("Fetch children error:", error)
      }
      setLoading(false)
    },
    [client, contextualFilters, dispatchForm, pluralChildEntityName]
  )

  useEffect(() => {
    fetchChildrenForAutocomplete(filters)
  }, [filters, fetchChildrenForAutocomplete])

  const updateFilters = useCallback(
    (filters: Record<string, string | boolean | null>) => {
      const mergedFilters = {
        ...contextualFilters,
        ...formState.data.filters,
        ...filters,
      }
      dispatchForm({
        type: FormActions.UPDATE,
        name: "filters",
        value: mergedFilters,
      })
    },
    [contextualFilters, dispatchForm, formState.data.filters]
  )

  return { formState, updateFilters, loading }
}
