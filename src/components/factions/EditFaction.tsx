"use client"

import type { Entity, Faction } from "@/types"
import { useState, useEffect } from "react"
import { FactionAutocomplete } from "@/components/autocomplete"

type EditFactionProps = {
  entity: Entity
  updateEntity: (entity: Entity) => void
}

export default function EditFaction({
  entity,
  updateEntity,
}: EditFactionProps) {
  const [faction, setFaction] = useState(entity.faction)

  // Sync local state when entity prop changes
  useEffect(() => {
    setFaction(entity.faction)
  }, [entity.faction])

  const handleFactionChange = async (selectedFaction: Faction | null) => {
    const updatedEntity = {
      ...entity,
      faction: selectedFaction,
      faction_id: selectedFaction?.id || null,
    }
    setFaction(selectedFaction)
    updateEntity(updatedEntity)
  }

  return (
    <FactionAutocomplete
      value={faction?.id || ""}
      onChange={handleFactionChange}
      exclude={faction?.id ? [faction.id] : []}
    />
  )
}
