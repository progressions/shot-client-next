/**
 * useChildEntities Hook
 *
 * Fetches and manages the full entity objects for child entities.
 * Provides optimistic update support with a ref flag to prevent
 * stale data from overwriting optimistic changes.
 *
 * @module components/ListManager/hooks/useChildEntities
 */

import { useState, useEffect, useRef } from "react"
import pluralize from "pluralize"
import { collectionNames } from "@/lib/maps"
import type { Fight } from "@/types"
import { filterConfigs } from "@/lib/filterConfigs"

interface Client {
  [key: string]: (
    params: Record<string, unknown>
  ) => Promise<{ data: Record<string, unknown> }>
}

/**
 * Hook to fetch and manage child entity data from API.
 *
 * Initializes state from parent entity data (shots or direct collections),
 * then fetches full entity data from the API. Includes optimistic update
 * support via a ref that temporarily blocks API refetches.
 *
 * @param childEntityName - Type of child entity (e.g., "Character", "Vehicle")
 * @param childIds - Array of child entity IDs to fetch
 * @param parentEntity - Parent Fight entity for initial data extraction
 * @param client - API client with dynamic get methods
 * @returns Object with childEntities state, setter, optimisticUpdateRef, and collection name
 *
 * @example
 * ```tsx
 * const { childEntities, setChildEntities, optimisticUpdateRef } =
 *   useChildEntities("Character", [1, 2, 3], fight, client)
 * ```
 */
export function useChildEntities(
  childEntityName: keyof typeof filterConfigs,
  childIds: (string | number)[],
  parentEntity: Fight,
  client: Client
) {
  const collection = collectionNames[childEntityName]
  const pluralChildEntityName = pluralize(childEntityName)

  const [childEntities, setChildEntities] = useState(() => {
    const shots = parentEntity.shots
    const parentCollection = parentEntity[
      collection as keyof Fight
    ] as unknown[]

    if (Array.isArray(parentCollection) && parentCollection.length) {
      return parentCollection
    }
    if (childEntityName === "Character" && Array.isArray(shots)) {
      return shots
        .map(shot => shot.character)
        .filter(Boolean)
        .map(character => ({
          ...character,
          entity_class: character.entity_class || "Character",
        }))
    }
    if (childEntityName === "Vehicle" && Array.isArray(shots)) {
      return shots
        .map(shot => shot.vehicle)
        .filter(Boolean)
        .map(vehicle => ({
          ...vehicle,
          entity_class: vehicle.entity_class || "Vehicle",
        }))
    }
    return []
  })
  const optimisticUpdateRef = useRef(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const fetchChildEntities = async () => {
      // Skip fetch if we just did an optimistic update
      if (optimisticUpdateRef.current) {
        // Reset the flag after a delay to allow the server state to catch up
        // This prevents the immediate re-render with stale data from overwriting our optimistic update
        timeoutId = setTimeout(() => {
          optimisticUpdateRef.current = false
        }, 2000)
        return
      }

      if (!childIds || childIds.length === 0) {
        setChildEntities([])
        return
      }

      try {
        const funcName = `get${pluralChildEntityName}`
        const getFunc = client[funcName]

        if (typeof getFunc !== "function") {
          console.error(`Function ${funcName} does not exist on client`)
          return
        }

        // Fetch unique entities from API
        const uniqueIds = [...new Set(childIds)]
        const response = await getFunc({
          sort: "name",
          order: "asc",
          ids: uniqueIds,
          per_page: 200,
        })

        // Map fetched entities back to childIds order, preserving duplicates
        const fetchedEntities = response.data[collection] || []
        const entityMap = new Map(
          fetchedEntities.map((entity: { id: string | number }) => [
            entity.id,
            entity,
          ])
        )
        const missingIds: (string | number)[] = []
        const orderedEntities = childIds
          .map(id => {
            const entity = entityMap.get(id)
            if (!entity) {
              missingIds.push(id)
            }
            return entity
          })
          .filter(Boolean)

        if (missingIds.length > 0) {
          console.warn(`Missing ${childEntityName} entities for some IDs`, {
            requestedIds: childIds,
            missingIds,
          })
        }

        setChildEntities(orderedEntities)
      } catch (error) {
        console.error(`Fetch ${childEntityName} error:`, error)
      }
    }
    fetchChildEntities()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [childIds, childEntityName, client, collection, pluralChildEntityName])

  return {
    childEntities,
    setChildEntities,
    optimisticUpdateRef,
    collection,
    pluralChildEntityName,
  }
}
