"use client"

/**
 * useEntityName Hook
 *
 * Fetches the current name of an entity by ID and type.
 * Used by MentionComponent to display up-to-date entity names
 * even when the stored mention data contains an outdated name.
 *
 * Subscribes to WebSocket updates to refresh the name in real-time
 * when the entity is modified.
 *
 * @module hooks/useEntityName
 */

import { useState, useEffect } from "react"
import { useClient, useCampaign } from "@/contexts"

type EntityType =
  | "Character"
  | "Site"
  | "Party"
  | "Faction"
  | "Juncture"
  | "Vehicle"
  | "Weapon"
  | "Schtick"

interface UseEntityNameResult {
  name: string | null
  loading: boolean
}

interface EntityWithId {
  id: string
  name?: string
}

/**
 * Hook to fetch the current name of an entity.
 * Shows the fetched name when available, allowing callers to fall back to a static label.
 * Subscribes to WebSocket updates for real-time name changes.
 *
 * @param id - The entity's UUID
 * @param entityType - The type of entity (Character, Site, Party, etc.)
 *
 * @returns Object with:
 * - `name` - The fetched entity name, or null if not yet loaded/error
 * - `loading` - Whether the fetch is in progress
 *
 * @example
 * ```tsx
 * const { name } = useEntityName(id, "Character")
 * const displayName = name || staticLabel
 * ```
 */
export function useEntityName(
  id: string,
  entityType: string
): UseEntityNameResult {
  const { client, user } = useClient()
  const { subscribeToEntity } = useCampaign()
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initial fetch on mount
  useEffect(() => {
    if (!user?.id || !id || !entityType) {
      setLoading(false)
      return
    }

    const fetchName = async () => {
      try {
        const response = await getEntityByType(
          client,
          entityType as EntityType,
          id
        )
        setName(response?.data?.name || null)
      } catch (error) {
        console.error(`Error fetching ${entityType} name:`, error)
        setName(null)
      } finally {
        setLoading(false)
      }
    }

    fetchName()
  }, [id, entityType, user?.id, client])

  // Subscribe to WebSocket updates for real-time name changes
  useEffect(() => {
    if (!id || !entityType || !subscribeToEntity) {
      return
    }

    // Convert entityType to lowercase for WebSocket subscription
    // e.g., "Character" -> "character"
    const wsEntityType = entityType.toLowerCase()

    const unsubscribe = subscribeToEntity(wsEntityType, (data: unknown) => {
      // Check if this update is for our entity
      const entity = data as EntityWithId | null
      if (entity?.id === id && entity?.name) {
        setName(entity.name)
      }
    })

    return unsubscribe
  }, [id, entityType, subscribeToEntity])

  return { name, loading }
}

async function getEntityByType(
  client: ReturnType<typeof import("@/lib/client/Client").default>,
  entityType: EntityType,
  id: string
) {
  // API expects { id } object, not raw string
  const entity = { id }
  const fetchers: Record<
    EntityType,
    () => Promise<{ data: { name: string } }>
  > = {
    Character: () => client.getCharacter(entity),
    Site: () => client.getSite(entity),
    Party: () => client.getParty(entity),
    Faction: () => client.getFaction(entity),
    Juncture: () => client.getJuncture(entity),
    Vehicle: () => client.getVehicle(entity),
    Weapon: () => client.getWeapon(entity),
    Schtick: () => client.getSchtick(entity),
  }

  const fetcher = fetchers[entityType]
  return fetcher ? fetcher() : null
}
