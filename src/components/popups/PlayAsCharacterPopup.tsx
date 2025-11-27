import { Box, Typography, Stack, CircularProgress } from "@mui/material"
import { EntityAvatar } from "@/components/avatars"
import { CharacterLink } from "@/components/ui/links"
import type { Character } from "@/types"
import { defaultCharacter } from "@/types"
import { useState, useEffect } from "react"
import { useClient } from "@/contexts/AppContext"

interface PlayAsCharacterPopupProps {
  id: string
}

export default function PlayAsCharacterPopup({
  id,
}: PlayAsCharacterPopupProps) {
  const { user, client } = useClient()
  const [character, setCharacter] = useState<Character>(defaultCharacter)

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await client.getCharacter({ id })
        const fetchedCharacter = response.data
        if (fetchedCharacter) {
          setCharacter(fetchedCharacter)
        }
      } catch (error) {
        console.error("Error fetching character:", error)
      }
    }

    if (user?.id && id) {
      fetchCharacter()
    }
  }, [user, id, client])

  if (!user?.id) {
    return null
  }

  if (!character?.id) {
    return (
      <Box sx={{ p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <EntityAvatar entity={character} disablePopup={true} />
        <Typography variant="h6">
          <CharacterLink character={character} disablePopup={true} />
        </Typography>
      </Stack>
    </Box>
  )
}
