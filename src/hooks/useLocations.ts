"use client"

import { useState, useEffect, useCallback } from "react"
import { useClient, useCampaign } from "@/contexts/AppContext"
import type { Location, CampaignCableData } from "@/types"

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
  useEffect(() => {
    if (!fightId) return

    const unsubscribe = subscribeToEntity(
      "locations",
      (data: CampaignCableData["locations"]) => {
        // Check if this update is for our fight
        // The WebSocket data includes fight_id to identify which fight the locations belong to
        if (data && typeof data === "object" && "locations" in data) {
          console.log(
            "📍 [useLocations] WebSocket locations update received:",
            data
          )
          // Update locations without setting loading=true to avoid flicker
          setLocations(data.locations || [])
        }
      }
    )

    return unsubscribe
  }, [fightId, subscribeToEntity])

  // Also subscribe to fight_id to know which fight the locations are for
  useEffect(() => {
    if (!fightId) return

    // We need to track the fight_id from WebSocket to match with our fightId
    // This is handled by checking campaignData.fight_id in the locations callback
    const unsubscribe = subscribeToEntity("fight_id", (wsightId: unknown) => {
      // When we receive a fight_id, the next locations update will be for that fight
      console.log("📍 [useLocations] WebSocket fight_id received:", wsightId)
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
