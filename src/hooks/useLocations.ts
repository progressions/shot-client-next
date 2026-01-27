"use client"

import { useState, useEffect, useCallback } from "react"
import { useClient, useCampaign } from "@/contexts/AppContext"
import type { Location } from "@/types"

interface UseLocationsResult {
  locations: Location[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and manage locations for a fight.
 * Subscribes to WebSocket updates for real-time location changes.
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
  const { subscribeToEntity } = useCampaign()
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

  // Initial fetch
  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  // Subscribe to WebSocket updates for locations
  // The locations array contains location objects with fight_id, so we can filter directly
  useEffect(() => {
    if (!fightId) return

    const unsubscribe = subscribeToEntity("locations", (data: unknown) => {
      // Data is an array of Location objects
      if (Array.isArray(data)) {
        // Filter to only include locations for this fight
        // Each location has a fight_id property we can use for verification
        const locationsData = data as Location[]

        // If locations array is empty, it might be for any fight - accept it
        // If locations have fight_id, verify they're for this fight
        const isForThisFight =
          locationsData.length === 0 ||
          locationsData.some(loc => loc.fight_id === fightId)

        if (!isForThisFight) {
          console.log(
            "📍 [useLocations] Ignoring locations update for different fight"
          )
          return
        }

        console.log(
          "📍 [useLocations] WebSocket locations update received for fight:",
          fightId,
          "with",
          locationsData.length,
          "locations"
        )
        // Update locations without setting loading=true to avoid flicker
        setLocations(locationsData)
      }
    })

    return unsubscribe
  }, [fightId, subscribeToEntity])

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
  }
}
