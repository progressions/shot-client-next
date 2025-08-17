"use client"

import type { Character } from "@/types"
import { Autocomplete } from "@/components/ui"
import { useState, useEffect } from "react"
import { CS } from "@/services"

type EditWealthProps = {
  type: string
  updateCharacter: (character: Character) => void
}

export default function EditWealth({
  character,
  updateCharacter,
}: EditWealthProps) {
  const [characterWealth, setCharacterWealth] = useState(CS.wealth(character))

  // Sync local state when character prop changes
  useEffect(() => {
    const newWealth = CS.wealth(character)
    setCharacterWealth(newWealth)
  }, [character])

  const fetchCharacterWealths = async () => {
    const characterWealths = ["Poor", "Working Stiff", "Rich"].map(type => ({
      label: type,
      value: type,
    }))
    return Promise.resolve(characterWealths)
  }

  const handleWealthChange = async (value: string | null) => {
    if (!value) return

    const updatedCharacter = {
      ...character,
      wealth: value,
    }
    setCharacterWealth(value)
    updateCharacter(updatedCharacter)
  }

  return (
    <Autocomplete
      label="Wealth"
      value={characterWealth || ""}
      fetchOptions={fetchCharacterWealths}
      onChange={handleWealthChange}
      allowNone={false}
    />
  )
}
