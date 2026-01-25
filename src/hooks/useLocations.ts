"use client"

import { useState, useEffect, useCallback } from "react"
import { useClient } from "@/contexts/AppContext"
import type { Location } from "@/types"

interface UseLocationsResult {
  locations: Location[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and manage locations for a fight.
 *
 * @param fightId - The fight ID to fetch locations for
 * @returns locations array, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { locations, loading, error, refetch } = useLocations(fightId)
 *
 * if (loading) return <CircularProgress />
 * if (error) return <Alert severity="error">{error}</Alert>
 *
 * return locations.map(location => <LocationZone key={location.id} location={location} />)
 * ```
 */
export function useLocations(fightId: string | undefined): UseLocationsResult {
  const { client } = useClient()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = useCallback(async () => {
    if (!fightId) {
      setLocations([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await client.getFightLocations(fightId)
      setLocations(response.data.locations || [])
    } catch (err) {
      console.error("Error fetching locations:", err)
      setError("Failed to load locations")
      setLocations([])
    } finally {
      setLoading(false)
    }
  }, [fightId, client])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
  }
}
