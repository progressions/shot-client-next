"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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

  // Track the latest fight_id from WebSocket to filter location updates
  const latestWsFightId = useRef<string | null>(null)

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

  // Subscribe to fight_id updates to track which fight locations belong to
  useEffect(() => {
    if (!fightId) return

    const unsubscribe = subscribeToEntity("fight_id", (wsFightId: unknown) => {
      if (typeof wsFightId === "string") {
        latestWsFightId.current = wsFightId
        console.log("📍 [useLocations] WebSocket fight_id received:", wsFightId)
      }
    })

    return unsubscribe
  }, [fightId, subscribeToEntity])

  // Subscribe to WebSocket updates for locations
  useEffect(() => {
    if (!fightId) return

    const unsubscribe = subscribeToEntity("locations", (data: unknown) => {
      // Only update if the locations are for this fight
      // The fight_id is broadcast alongside locations and stored in latestWsFightId
      if (latestWsFightId.current && latestWsFightId.current !== fightId) {
        console.log(
          "📍 [useLocations] Ignoring locations update for different fight:",
          latestWsFightId.current,
          "!==",
          fightId
        )
        return
      }

      // Data is now an array of Location objects (not nested)
      if (Array.isArray(data)) {
        console.log(
          "📍 [useLocations] WebSocket locations update received for fight:",
          fightId
        )
        // Update locations without setting loading=true to avoid flicker
        setLocations(data as Location[])
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
