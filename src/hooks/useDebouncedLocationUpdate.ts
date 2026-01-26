import { useRef, useCallback, useEffect } from "react"
import { useClient, useToast } from "@/contexts"
import type { Location } from "@/types"

interface PendingUpdate {
  position_x?: number
  position_y?: number
  width?: number
  height?: number
}

/**
 * Hook for debounced location position/size updates.
 * Batches rapid changes (from dragging/resizing) and saves after a delay.
 */
export function useDebouncedLocationUpdate(debounceMs: number = 300) {
  const { client } = useClient()
  const { toastError } = useToast()
  const pendingUpdates = useRef<Map<string, PendingUpdate>>(new Map())
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const saveUpdate = useCallback(
    async (locationId: string) => {
      const updates = pendingUpdates.current.get(locationId)
      if (!updates) return

      pendingUpdates.current.delete(locationId)
      timeoutRefs.current.delete(locationId)

      try {
        await client.updateLocation(locationId, updates)
      } catch (err) {
        console.error("Failed to save location update:", err)
        toastError("Failed to save location position")
      }
    },
    [client, toastError]
  )

  const queueUpdate = useCallback(
    (location: Location, updates: PendingUpdate) => {
      if (!location.id) return

      // Merge with any pending updates for this location
      const existing = pendingUpdates.current.get(location.id) || {}
      pendingUpdates.current.set(location.id, { ...existing, ...updates })

      // Clear any existing timeout
      const existingTimeout = timeoutRefs.current.get(location.id)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set new timeout
      const timeout = setTimeout(() => saveUpdate(location.id!), debounceMs)
      timeoutRefs.current.set(location.id, timeout)
    },
    [debounceMs, saveUpdate]
  )

  // Force immediate save (useful when drag ends)
  const flushUpdate = useCallback(
    (locationId: string) => {
      const existingTimeout = timeoutRefs.current.get(locationId)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        timeoutRefs.current.delete(locationId)
      }
      saveUpdate(locationId)
    },
    [saveUpdate]
  )

  // Cleanup all pending timeouts on unmount
  useEffect(() => {
    const timeouts = timeoutRefs.current
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
      timeouts.clear()
    }
  }, [])

  return { queueUpdate, flushUpdate }
}
