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
  // Track fight_id from websocket payloads to reliably filter cross-fight updates.
  const latestWsFightId = useRef<string | undefined>(fightId)

  useEffect(() => {
    latestWsFightId.current = fightId
  }, [fightId])

  const fetchLocations = useCallback(
    async (showLoading: boolean = true) => {
      if (!fightId) {
        setLocations([])
        setError(null)
        setLoading(false)
        return
      }

      if (showLoading) {
        setLoading(true)
      }
      setError(null)

      try {
        const response = await client.getFightLocations(fightId)
        setLocations(response.data.locations || [])
      } catch (err) {
        console.error("Error fetching locations:", err)
        setError("Failed to load locations")
        setLocations([])
      } finally {
        if (showLoading) {
          setLoading(false)
        }
      }
    },
    [fightId, client]
  )

  // Initial fetch
  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  // Subscribe to fight_id updates for precise fight scoping.
  useEffect(() => {
    if (!fightId) return

    const unsubscribe = subscribeToEntity("fight_id", (wsFightId: unknown) => {
      if (typeof wsFightId === "string") {
        latestWsFightId.current = wsFightId
      }
    })

    return unsubscribe
  }, [fightId, subscribeToEntity])

  // Subscribe to WebSocket updates for locations
  // Accept both direct arrays and wrapped payload shapes.
  useEffect(() => {
    if (!fightId) return

    const unsubscribe = subscribeToEntity("locations", (data: unknown) => {
      const currentFightId = latestWsFightId.current
      if (currentFightId && currentFightId !== fightId) {
        return
      }

      const locationsData = Array.isArray(data)
        ? (data as Location[])
        : data &&
            typeof data === "object" &&
            "locations" in (data as Record<string, unknown>) &&
            Array.isArray((data as { locations: unknown }).locations)
          ? ((data as { locations: Location[] }).locations ?? [])
          : null

      if (!locationsData) return

      const hasFightIds = locationsData.some(loc => !!loc.fight_id)
      const isForThisFight =
        locationsData.length === 0 ||
        !hasFightIds ||
        locationsData.some(loc => loc.fight_id === fightId)

      if (!isForThisFight) return

      // Update locations without loading state changes to avoid UI flicker.
      setLocations(locationsData)
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
