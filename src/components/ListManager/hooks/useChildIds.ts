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
import type { Entity, Fight } from "@/types"
import { filterConfigs } from "@/lib/filterConfigs"

/**
 * Parent entity type that can contain child relationships.
 * Includes Fight (with shots) and other entities with ID arrays.
 */
type ParentEntity = Entity & {
  shots?: Fight["shots"]
  [key: string]: unknown
}

/**
 * Hook to extract child entity IDs from a parent entity.
 *
 * For Characters and Vehicles in Fights, first attempts to extract IDs from the shots array
 * (character_id/vehicle_id), falling back to direct ID arrays on the parent entity.
 *
 * @param parentEntity - The parent entity (Fight, Adventure, etc.)
 * @param childEntityName - Type of child entity (e.g., "Character", "Vehicle")
 * @param relationship - Optional override for the relationship key (e.g., "villains" instead of "characters")
 * @returns Object with childIds array and childIdsKey property name
 *
 * @example
 * ```tsx
 * const { childIds, childIdsKey } = useChildIds(fight, "Character")
 * // childIds: ["uuid-1", "uuid-2", "uuid-3"]
 * // childIdsKey: "character_ids"
 *
 * // With relationship override:
 * const { childIds, childIdsKey } = useChildIds(adventure, "Character", "villains")
 * // childIdsKey: "villain_ids"
 * ```
 */
export function useChildIds(
  parentEntity: ParentEntity,
  childEntityName: keyof typeof filterConfigs,
  relationship?: string
) {
  // Use relationship override if provided, otherwise derive from childEntityName
  const childIdsKey = relationship
    ? `${relationship.replace(/s$/, "")}_ids`
    : `${childEntityName.toLowerCase()}_ids`
  const shots = parentEntity.shots
  const directIds = parentEntity[childIdsKey] as string[]

  const childIds = useMemo(() => {
    // For Characters and Vehicles, preserve duplicates from shots
    // (same entity can have multiple shots in a fight)
    if (childEntityName === "Character" && Array.isArray(shots)) {
      const idsFromShots = shots
        .map(shot => shot.character_id)
        .filter((id): id is string => typeof id === "string")
      if (idsFromShots.length > 0) return idsFromShots
    }
    if (childEntityName === "Vehicle" && Array.isArray(shots)) {
      const idsFromShots = shots
        .map(shot => shot.vehicle_id)
        .filter((id): id is string => typeof id === "string")
      if (idsFromShots.length > 0) return idsFromShots
    }

    // Use direct IDs from parent entity (preserves duplicates)
    if (Array.isArray(directIds) && directIds.length > 0) {
      return directIds
    }
    return []
  }, [childEntityName, shots, directIds, relationship])

  return { childIds, childIdsKey }
}
