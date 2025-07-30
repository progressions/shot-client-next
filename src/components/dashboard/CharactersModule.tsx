import { Stack, Box, Typography } from "@mui/material"
import Link from "next/link"
import type { Character } from "@/types"
import { CharacterBadge } from "@/components/badges"

type CharactersModuleProps = {
  characters: Character[]
}

export default function CharactersModule({
  characters,
}: CharactersModuleProps) {
  return (
    <Box
      sx={{
        flexGrow: 1,
        width: { xs: "100%", sm: "auto" },
        p: 2,
        borderRadius: 2,
        backgroundColor: "#2d2d2d",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Your Characters
      </Typography>
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {characters.map(character => (
          <CharacterBadge key={character.id} character={character} size="sm" />
        ))}
      </Stack>
      <Typography variant="body2">
        <Link
          href="/characters"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          All characters
        </Link>
      </Typography>
    </Box>
  )
}
