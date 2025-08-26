"use client"

import type { Character } from "@/types"
import { Autocomplete } from "@/components/ui"
import { useState, useEffect } from "react"
import { CS } from "@/services"
import { useClient } from "@/contexts"

type EditTypeProps = {
  type: string
  updateCharacter: (character: Character) => void
}

export default function EditType({
  character,
  updateCharacter,
}: EditTypeProps) {
  const { client } = useClient()
  const [archetype, setArchetype] = useState(CS.archetype(character))

  // Sync local state when character prop changes
  useEffect(() => {
    setArchetype(CS.archetype(character))
  }, [character])

  const fetchArchetypes = async (inputValue: string) => {
    const response = await client.getCharacters({ per_page: 1000 })
    const archetypes = response.data.archetypes.filter(archetype =>
      archetype.toLowerCase().includes(inputValue.toLowerCase())
    )

    return archetypes.map(archetype => ({
      label: archetype,
      value: archetype,
    }))
  }

  const handleTypeChange = async (value: string | null) => {
    const updatedCharacter = CS.updateActionValue(
      character,
      "Archetype",
      value || null
    )
    setArchetype(value || null)
    updateCharacter(updatedCharacter)
  }

  return (
    <Autocomplete
      label="Archetype"
      freeSolo
      value={archetype || ""}
      fetchOptions={fetchArchetypes}
      onChange={handleTypeChange}
      allowNone={true}
    />
  )
}
