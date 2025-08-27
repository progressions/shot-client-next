import { useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { queryParams } from "@/lib"

export interface EntityFilterConfig {
  name: string
  label: string
  defaultValue?: boolean | string
  type?: "checkbox" | "dropdown"
}

interface UseEntityFiltersOptions {
  filterConfigs: EntityFilterConfig[]
  basePath: string
  otherFilters?: Record<string, unknown>
  onFiltersChange?: (filters: Record<string, unknown>) => void
}

export function useEntityFilters({
  filterConfigs,
  basePath,
  otherFilters = {},
  onFiltersChange,
}: UseEntityFiltersOptions) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL params
  const initializeFilters = useCallback(() => {
    const filters: Record<string, boolean | string> = {}
    filterConfigs.forEach(config => {
      const urlValue = searchParams.get(config.name)
      if (config.type === "dropdown") {
        // For dropdowns, use the URL value or default
        filters[config.name] =
          urlValue !== null ? urlValue : config.defaultValue || ""
      } else {
        // For checkboxes, parse as boolean
        if (urlValue !== null) {
          filters[config.name] = urlValue === "true"
        } else {
          filters[config.name] = config.defaultValue || false
        }
      }
    })
    return filters
  }, [filterConfigs, searchParams])

  const [filters, setFilters] = useState(initializeFilters)

  // Update URL when filters change
  const updateFilters = useCallback(
    (newFilters: Record<string, boolean | string | null>) => {
      // Merge with other filters (like sort, search, etc.)
      const combinedFilters = {
        ...otherFilters,
        ...newFilters,
      }

      // Filter out false boolean values and empty strings to keep URL clean
      const cleanFilters = Object.entries(combinedFilters).reduce(
        (acc, [key, value]) => {
          if (value === true || (value && value !== false && value !== "")) {
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, any>
      )

      // Update internal state for all filter types
      const updatedFilters: Record<string, boolean | string> = {}
      filterConfigs.forEach(config => {
        if (config.name in newFilters) {
          updatedFilters[config.name] = newFilters[config.name] as
            | boolean
            | string
        }
      })
      setFilters(prev => ({ ...prev, ...updatedFilters }))

      // Update URL
      const url = `${basePath}?${queryParams(cleanFilters)}`
      router.push(url, { scroll: false })

      // Notify parent component
      onFiltersChange?.(combinedFilters)
    },
    [basePath, filterConfigs, otherFilters, router, onFiltersChange]
  )

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    const defaultFilters: Record<string, boolean | string> = {}
    filterConfigs.forEach(config => {
      defaultFilters[config.name] =
        config.defaultValue || (config.type === "dropdown" ? "" : false)
    })
    updateFilters(defaultFilters)
  }, [filterConfigs, updateFilters])

  // Get active filter count - for dropdowns, count non-default values
  const activeFilterCount = filterConfigs.reduce((count, config) => {
    const value = filters[config.name]
    if (config.type === "dropdown") {
      return (
        count +
        (value !== config.defaultValue && value !== undefined && value !== ""
          ? 1
          : 0)
      )
    } else {
      return count + (value === true ? 1 : 0)
    }
  }, 0)

  return {
    filters,
    updateFilters,
    resetFilters,
    activeFilterCount,
  }
}
