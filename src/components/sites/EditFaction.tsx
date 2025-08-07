"use client"

import type { Entity } from "@/types"
import { useState } from "react"
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

  const handleFactionChange = async (value: string | null) => {
    if (!value) return

    const updatedEntity = {
      ...entity,
      faction: value,
      faction_id: value.id,
    }
    setFaction(value)
    updateEntity(updatedEntity)
  }

  return (
    <FactionAutocomplete
      value={faction?.id || ""}
      onChange={handleFactionChange}
      exclude={[entity.faction_id]}
    />
  )
}
