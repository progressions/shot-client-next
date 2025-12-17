"use client"

import type { Character, Juncture } from "@/types"
import { useState, useEffect } from "react"
import { JunctureAutocomplete } from "@/components/autocomplete"

type EditJunctureProps = {
  character: Character
  updateCharacter: (character: Character) => void
}

export default function EditJuncture({
  character,
  updateCharacter,
}: EditJunctureProps) {
  const [juncture, setJuncture] = useState(character.juncture)

  // Sync local state when character prop changes
  useEffect(() => {
    setJuncture(character.juncture)
  }, [character.juncture])

  const handleJunctureChange = async (selectedJuncture: Juncture | null) => {
    const updatedCharacter = {
      ...character,
      juncture: selectedJuncture,
      juncture_id: selectedJuncture?.id || null,
    }
    setJuncture(selectedJuncture)
    updateCharacter(updatedCharacter)
  }

  return (
    <JunctureAutocomplete
      value={juncture?.id || ""}
      onChange={handleJunctureChange}
      exclude={juncture?.id ? [juncture.id] : []}
    />
  )
}
