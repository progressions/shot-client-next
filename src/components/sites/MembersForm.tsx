"use client"

import { useState } from "react"
import { IconButton, Box, Button, Stack } from "@mui/material"
import type { Character, Site } from "@/types"
import { CharacterAutocomplete } from "@/components/autocomplete"
import { CharacterBadge } from "@/components/badges"
import { useClient } from "@/contexts"
import DeleteIcon from "@mui/icons-material/Delete"

interface MembersFormProps {
  open: boolean
  site: Site
}

export default function MembersForm({ open, site }: MembersFormProps) {
  const { client } = useClient()
  const [characterId, setCharacter] = useState<string | null>(null)
  const character_ids = site.characters?.map(actor => actor.id) || []

  const handleAutocompleteChange = (value: string | null) => {
    setCharacter(value)
  }

  const handleAddMember = async () => {
    if (!characterId) return
    if (character_ids.includes(characterId)) {
      alert("Character is already a member of this site.")
      return
    }

    try {
      const formData = new FormData()
      const siteData = {
        ...site,
        character_ids: [...character_ids, characterId],
      } as Site
      formData.append("site", JSON.stringify(siteData))
      formData.set("site", JSON.stringify(siteData))
      await client.updateSite(site.id, formData)

      setCharacter(null)
    } catch (error) {
      console.error("Error adding site member:", error)
      alert("Failed to add character to site. Please try again.")
    }
  }

  const handleDelete = async (actor: Character) => {
    try {
      const formData = new FormData()
      const updatedCharacterIds = character_ids.filter(id => id !== actor.id)
      const siteData = { ...site, character_ids: updatedCharacterIds } as Site
      formData.append("site", JSON.stringify(siteData))
      await client.updateSite(site.id, formData)
    } catch (error) {
      console.error("Error removing site member:", error)
      alert("Failed to remove character from site. Please try again.")
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
        {site.characters && site.characters.length > 0
          ? site.characters.map((actor: Character, index: number) => (
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
