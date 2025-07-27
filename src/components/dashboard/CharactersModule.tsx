import { Box, Typography } from "@mui/material"
import Link from "next/link"
import { CharacterName } from "@/components/characters"
import type { Character } from "@/types/types"

type CharactersModuleProps = {
  characters: Character[]
}

export default function CharactersModule({ characters }: CharactersModuleProps) {
  return (
    <Box sx={{ flexGrow: 1, width: { xs: "100%", sm: "auto" }, p: 2, borderRadius: 2, backgroundColor: "#1d1d1d" }}>
      <Typography variant="h6" gutterBottom>
        Your Characters
      </Typography>
      {characters.map(character => (
        <Box key={character.id} sx={{ mb: 1, p: 1, borderRadius: 1, backgroundColor: "#2d2d2d" }}>
          <Typography variant="body1">
            <Link href={`/characters/${character.id}`} style={{ color: "#fff", textDecoration: "none" }}>
              <CharacterName character={character} />
            </Link>
          </Typography>
        </Box>
      ))}
      <Typography variant="body2">
        <Link href="/characters" style={{ color: "#fff", textDecoration: "underline" }}>
          All characters
        </Link>
      </Typography>
    </Box>
  )
}
