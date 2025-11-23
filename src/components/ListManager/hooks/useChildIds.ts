import { useMemo } from "react"
import type { Fight } from "@/types"
import { filterConfigs } from "@/lib/filterConfigs"

export function useChildIds(
  parentEntity: Fight,
  childEntityName: keyof typeof filterConfigs
) {
  const childIdsKey = `${childEntityName.toLowerCase()}_ids`
  const shots = parentEntity.shots
  // @ts-ignore - Dynamic access to parentEntity based on childIdsKey
  const directIds = parentEntity[childIdsKey]

  const childIds = useMemo(() => {
    if (childEntityName === "Character" && Array.isArray(shots)) {
      const idsFromShots = shots
        .map(shot => shot.character_id)
        .filter(Boolean)
        .filter((id, index, self) => self.indexOf(id) === index)
      if (idsFromShots.length > 0) return idsFromShots
    }
    if (childEntityName === "Vehicle" && Array.isArray(shots)) {
      const idsFromShots = shots
        .map(shot => shot.vehicle_id)
        .filter(Boolean)
        .filter((id, index, self) => self.indexOf(id) === index)
      if (idsFromShots.length > 0) return idsFromShots
    }

    if (Array.isArray(directIds) && directIds.length > 0) {
      return directIds
    }
    return []
  }, [childEntityName, shots, directIds])

  return { childIds, childIdsKey }
}
