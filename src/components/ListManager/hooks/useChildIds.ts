import { useMemo } from "react"
import type { Fight } from "@/types"
import { filterConfigs } from "@/lib/filterConfigs"

export function useChildIds(
  parentEntity: Fight,
  childEntityName: keyof typeof filterConfigs
) {
  const childIdsKey = `${childEntityName.toLowerCase()}_ids`

  const childIds = useMemo(() => {
    if (childEntityName === "Character" && Array.isArray(parentEntity.shots)) {
      const idsFromShots = parentEntity.shots
        .map(shot => shot.character_id)
        .filter(Boolean)
        .filter((id, index, self) => self.indexOf(id) === index)
      if (idsFromShots.length > 0) return idsFromShots
    }
    if (childEntityName === "Vehicle" && Array.isArray(parentEntity.shots)) {
      const idsFromShots = parentEntity.shots
        .map(shot => shot.vehicle_id)
        .filter(Boolean)
        .filter((id, index, self) => self.indexOf(id) === index)
      if (idsFromShots.length > 0) return idsFromShots
    }

    const ids = parentEntity[childIdsKey]
    if (Array.isArray(ids) && ids.length > 0) {
      return ids
    }
    return []
  }, [childEntityName, childIdsKey, parentEntity])

  return { childIds, childIdsKey }
}
