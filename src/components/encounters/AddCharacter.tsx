"use client"

import { useState } from "react"
import { Stack } from "@mui/material"
import { CharacterFilter } from "@/components/characters"
import { type Character } from "@/types"
import { useEncounter, useToast, useClient } from "@/contexts"

export default function AddCharacter({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  )

  // Add a wrapper to debug setSelectedCharacter calls
  const handleSetSelectedCharacter = (character: Character | null) => {
    console.log(
      "[AddCharacter] Setting selected character to:",
      character?.name || "null"
    )
    setSelectedCharacter(character)
  }

  const handleAddMember = async (character: Character) => {
    console.log("[AddCharacter] handleAddMember called with:", character)
    if (!character || !encounter) {
      console.log("Missing character or encounter", { character, encounter })
      return
    }

    try {
      console.log("Adding character to fight:", character.name)
      await client.addCharacter(encounter, character)
      toastSuccess(`Added ${character.name} to the fight`)
      setSelectedCharacter(null)
      onClose()
    } catch (error) {
      console.error("Error adding character to fight:", error)
      toastError(`Failed to add ${character.name} to the fight`)
    }
  }

  // Debug logging
  console.log("[AddCharacter] Current selectedCharacter:", selectedCharacter)

  const handleDispatch = (action: unknown) => {
    // CharacterFilter expects a dispatch function for managing its internal state
    // We don't need to handle this externally for our use case
  }

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1}
    >
      <CharacterFilter
        value={selectedCharacter?.id || null}
        setSelectedChild={handleSetSelectedCharacter}
        addMember={handleAddMember}
        dispatch={handleDispatch}
        omit={[]}
      />
    </Stack>
  )
}
