"use client"

import { useState } from "react"
import { Stack } from "@mui/material"
import { AddButton, DialogBox } from "@/components/ui"
import { CharacterFilter } from "@/components/characters"
import { type Entity } from "@/types"
import { useEncounter } from "@/contexts"

type AddCharacterProps = {
  open?: boolean
  onClose?: () => void
}

export default function AddCharacter({
  open = false,
  onClose,
}: AddCharacterProps) {
  const { encounter, updateEncounter } = useEncounter()
  const [entity, setEntity] = useState<Entity | null>(null)

  const handleAdd = async () => {
    console.log("about to add", entity)
    const updatedEncounter = {
      ...encounter,
      character_ids: [...encounter.character_ids, entity!.id],
    }
    await updateEncounter(updatedEncounter)
    setEntity(null)
  }

  return (
    <DialogBox open={open} onClose={onClose}>
      <Stack
        sx={{ width: { xs: "100%", md: 740 } }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <CharacterFilter entity={entity} setEntity={setEntity} handleAddCharacter={handleAdd} />
      </Stack>
    </DialogBox>
  )
}
