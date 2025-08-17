"use client"

import type { Character } from "@/types"
import { useState, useEffect } from "react"
import { JunctureAutocomplete } from "@/components/autocomplete"

type EditTypeProps = {
  type: string
  updateCharacter: (character: Character) => void
}

export default function EditType({
  character,
  updateCharacter,
}: EditTypeProps) {
  const [juncture, setJuncture] = useState(character.juncture)

  // Sync local state when character prop changes
  useEffect(() => {
    setJuncture(character.juncture)
  }, [character.juncture])

  const handleJunctureChange = async (value: string | null) => {
    if (!value) return

    const updatedCharacter = {
      ...character,
      juncture: value,
      juncture_id: value.id,
    }
    setJuncture(value)
    updateCharacter(updatedCharacter)
  }

  return (
    <JunctureAutocomplete
      value={juncture?.id || ""}
      onChange={handleJunctureChange}
      exclude={[character.juncture_id]}
    />
  )
}
