import { useState, useEffect, useRef, useMemo } from "react"
import pluralize from "pluralize"
import { collectionNames } from "@/lib/maps"
import type { Fight } from "@/types"
import { filterConfigs } from "@/lib/filterConfigs"

interface Client {
  [key: string]: (
    params: Record<string, unknown>
  ) => Promise<{ data: Record<string, unknown> }>
}

export function useChildEntities(
  childEntityName: keyof typeof filterConfigs,
  childIds: (string | number)[],
  parentEntity: Fight,
  client: Client
) {
  const collection = collectionNames[childEntityName]
  const pluralChildEntityName = pluralize(childEntityName)

  // Extract specific properties to stabilize dependencies
  const shots = parentEntity.shots
  const parentCollection = parentEntity[collection as keyof Fight] as any[]

  const defaultEntities = useMemo(() => {
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
  }, [childEntityName, collection, parentCollection, shots])

  const [childEntities, setChildEntities] = useState(defaultEntities)
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

        const response = await getFunc({
          sort: "name",
          order: "asc",
          ids: childIds,
          per_page: 200,
        })

        setChildEntities(response.data[collection] || [])
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
