import { useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { queryParams } from "@/lib"

export interface EntityFilterConfig {
  name: string
  label: string
  defaultValue?: boolean
}

interface UseEntityFiltersOptions {
  filterConfigs: EntityFilterConfig[]
  basePath: string
  otherFilters?: Record<string, any>
  onFiltersChange?: (filters: Record<string, any>) => void
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
    const filters: Record<string, boolean> = {}
    filterConfigs.forEach(config => {
      const urlValue = searchParams.get(config.name)
      if (urlValue !== null) {
        filters[config.name] = urlValue === "true"
      } else {
        filters[config.name] = config.defaultValue || false
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

      // Update internal state for boolean filters only
      const booleanFilters: Record<string, boolean> = {}
      filterConfigs.forEach(config => {
        if (config.name in newFilters) {
          booleanFilters[config.name] = newFilters[config.name] as boolean
        }
      })
      setFilters(prev => ({ ...prev, ...booleanFilters }))

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
    const defaultFilters: Record<string, boolean> = {}
    filterConfigs.forEach(config => {
      defaultFilters[config.name] = config.defaultValue || false
    })
    updateFilters(defaultFilters)
  }, [filterConfigs, updateFilters])

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return {
    filters,
    updateFilters,
    resetFilters,
    activeFilterCount,
  }
}
