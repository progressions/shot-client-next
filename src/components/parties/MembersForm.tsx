"use client"

import { useState } from "react"
import { IconButton, Box, Button, Stack } from "@mui/material"
import type { Character, Party } from "@/types"
import { CharacterAutocomplete } from "@/components/autocomplete"
import { CharacterBadge } from "@/components/badges"
import { useClient } from "@/contexts"
import DeleteIcon from "@mui/icons-material/Delete"

interface MembersFormProps {
  open: boolean
  party: Party
}

export default function MembersForm({ open, party }: MembersFormProps) {
  const { client } = useClient()
  const [characterId, setCharacter] = useState<string | null>(null)
  const character_ids = party.characters?.map(actor => actor.id) || []

  const handleAutocompleteChange = (value: string | null) => {
    setCharacter(value)
  }

  const handleAddMember = async () => {
    if (!characterId) return
    if (character_ids.includes(characterId)) {
      alert("Character is already a member of this party.")
      return
    }

    try {
      const formData = new FormData()
      const partyData = {
        ...party,
        character_ids: [...character_ids, characterId],
      } as Party
      formData.append("party", JSON.stringify(partyData))
      formData.set("party", JSON.stringify(partyData))
      await client.updateParty(party.id, formData)

      setCharacter(null)
    } catch (error) {
      console.error("Error adding party member:", error)
      alert("Failed to add character to party. Please try again.")
    }
  }

  const handleDelete = async (actor: Character) => {
    try {
      const formData = new FormData()
      const updatedCharacterIds = character_ids.filter(id => id !== actor.id)
      const partyData = {
        ...party,
        character_ids: updatedCharacterIds,
      } as Party
      formData.append("party", JSON.stringify(partyData))
      await client.updateParty(party.id, formData)
    } catch (error) {
      console.error("Error removing party member:", error)
      alert("Failed to remove character from party. Please try again.")
    }
  }

  if (!open) return
  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        border: "1px solid #1e1e1e",
        backgroundColor: "#2f2f2f",
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        <CharacterAutocomplete
          value={characterId || ""}
          onChange={handleAutocompleteChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddMember}
          sx={{ height: "3rem", px: 2 }}
        >
          Add
        </Button>
      </Stack>
      <Stack direction="column" spacing={1} sx={{ mt: 2 }}>
        {party.characters && party.characters.length > 0
          ? party.characters.map((actor: Character, index: number) => (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                key={`${actor.id}-${index}`}
              >
                <Box sx={{ width: "100%" }}>
                  <CharacterBadge character={actor} />
                </Box>
                <Box>
                  <IconButton
                    color="inherit"
                    onClick={() => handleDelete(actor)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            ))
          : null}
      </Stack>
    </Box>
  )
}
