import { Box, Typography, Stack } from "@mui/material"
import { EntityAvatar } from "@/components/avatars"
import { CharacterLink } from "@/components/ui/links"
import type { Character } from "@/types"

interface PlayAsCharacterPopupProps {
  character: Character
}

export default function PlayAsCharacterPopup({
  character,
}: PlayAsCharacterPopupProps) {
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
