import { useState, useEffect, useCallback, useMemo } from "react"
import { FormActions, useForm } from "@/reducers"

interface Client {
  [key: string]: (
    params: Record<string, unknown>
  ) => Promise<{ data: Record<string, unknown> }>
}

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
