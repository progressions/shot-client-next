"use client"

import type { Character } from "@/types"
import { Autocomplete } from "@/components/ui"
import { useState } from "react"
import { CS } from "@/services"

type EditWealthProps = {
  type: string
  updateCharacter: (character: Character) => void
}

export default function EditWealth({
  character,
  updateCharacter,
}: EditWealthProps) {
  const [characterWealth, setCharacterWealth] = useState(CS.type(character))

  const fetchCharacterWealths = async () => {
    const characterWealths = ["Poor", "Working Stiff", "Rich"].map(type => ({
      label: type,
      value: type,
    }))
    return Promise.resolve(characterWealths)
  }

  const handleWealthChange = async (value: string | null) => {
    if (!value) return

    const updatedCharacter = CS.updateActionValue(character, "Wealth", value)
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
