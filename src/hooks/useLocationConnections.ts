"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useClient, useCampaign } from "@/contexts/AppContext"
import type { LocationConnection } from "@/types"

interface UseLocationConnectionsResult {
  connections: LocationConnection[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch and manage location connections for a fight.
 * Subscribes to WebSocket updates for real-time connection changes.
 *
 * @param fightId - The fight ID to fetch connections for
 * @returns connections array, loading state, error state, and refetch function
 *
 * @example
 * ```tsx
 * const { connections, loading, error, refetch } = useLocationConnections(fightId)
 *
 * if (loading) return <CircularProgress />
 * if (error) return <Alert severity="error">{error}</Alert>
 *
 * return connections.map(conn => <ConnectionLine key={conn.id} connection={conn} />)
 * ```
 */
export function useLocationConnections(
  fightId: string | undefined
): UseLocationConnectionsResult {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const [connections, setConnections] = useState<LocationConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track the latest fight_id from WebSocket to filter connection updates
  const latestWsFightId = useRef<string | null>(null)

  const fetchConnections = useCallback(async () => {
    if (!fightId) {
      setConnections([])
      setError(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await client.getFightLocationConnections(fightId)
      setConnections(response.data.location_connections || [])
    } catch (err) {
      console.error("Error fetching location connections:", err)
      setError("Failed to load location connections")
      setConnections([])
    } finally {
      setLoading(false)
    }
  }, [fightId, client])

  // Initial fetch
  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  // Subscribe to fight_id updates to track which fight connections belong to
  useEffect(() => {
    if (!fightId) return

    const unsubscribe = subscribeToEntity("fight_id", (wsFightId: unknown) => {
      if (typeof wsFightId === "string") {
        latestWsFightId.current = wsFightId
        console.log(
          "[useLocationConnections] WebSocket fight_id received:",
          wsFightId
        )
      }
    })

    return unsubscribe
  }, [fightId, subscribeToEntity])

  // Subscribe to WebSocket updates for location_connections (full array)
  useEffect(() => {
    if (!fightId) return

    const unsubscribe = subscribeToEntity(
      "location_connections",
      (data: unknown) => {
        // Only update if the connections are for this fight
        if (latestWsFightId.current && latestWsFightId.current !== fightId) {
          console.log(
            "[useLocationConnections] Ignoring connections update for different fight:",
            latestWsFightId.current,
            "!==",
            fightId
          )
          return
        }

        // Data is an array of LocationConnection objects
        if (Array.isArray(data)) {
          console.log(
            "[useLocationConnections] WebSocket location_connections update received for fight:",
            fightId
          )
          setConnections(data as LocationConnection[])
        }
      }
    )

    return unsubscribe
  }, [fightId, subscribeToEntity])

  return {
    connections,
    loading,
    error,
    refetch: fetchConnections,
  }
}
