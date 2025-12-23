/**
 * useChildIds Hook
 *
 * Extracts child entity IDs from a parent Fight entity.
 * Handles special cases for Characters and Vehicles which can be
 * derived from shots or stored directly as ID arrays.
 *
 * @module components/ListManager/hooks/useChildIds
 */

import { useMemo } from "react"
import type { Fight } from "@/types"
import { filterConfigs } from "@/lib/filterConfigs"

/**
 * Hook to extract child entity IDs from a parent Fight.
 *
 * For Characters and Vehicles, first attempts to extract IDs from the shots array
 * (character_id/vehicle_id), falling back to direct ID arrays on the parent entity.
 *
 * @param parentEntity - The parent Fight entity
 * @param childEntityName - Type of child entity (e.g., "Character", "Vehicle")
 * @returns Object with childIds array and childIdsKey property name
 *
 * @example
 * ```tsx
 * const { childIds, childIdsKey } = useChildIds(fight, "Character")
 * // childIds: ["uuid-1", "uuid-2", "uuid-3"]
 * // childIdsKey: "character_ids"
 * ```
 */
export function useChildIds(
  parentEntity: Fight,
  childEntityName: keyof typeof filterConfigs
) {
  const childIdsKey = `${childEntityName.toLowerCase()}_ids` as keyof Fight
  const shots = parentEntity.shots
  const directIds = parentEntity[childIdsKey] as string[]

  const childIds = useMemo(() => {
    // For Characters and Vehicles, preserve duplicates from shots
    // (same entity can have multiple shots in a fight)
    if (childEntityName === "Character" && Array.isArray(shots)) {
      const idsFromShots = shots
        .map(shot => shot.character_id)
        .filter(Boolean) as string[]
      if (idsFromShots.length > 0) return idsFromShots
    }
    if (childEntityName === "Vehicle" && Array.isArray(shots)) {
      const idsFromShots = shots
        .map(shot => shot.vehicle_id)
        .filter(Boolean) as string[]
      if (idsFromShots.length > 0) return idsFromShots
    }

    // Use direct IDs from parent entity (preserves duplicates)
    if (Array.isArray(directIds) && directIds.length > 0) {
      return directIds
    }
    return []
  }, [childEntityName, shots, directIds])

  return { childIds, childIdsKey }
}
