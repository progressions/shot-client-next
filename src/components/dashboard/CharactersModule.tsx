import { Stack, Box, Typography } from "@mui/material"
import Link from "next/link"
import type { Character } from "@/types"
import { CharacterBadge } from "@/components/badges"
import { Icon } from "@/components/ui"
import { ModuleHeader } from "@/components/dashboard"

type CharactersModuleProperties = {
  characters: Character[]
}

export default function CharactersModule({
  characters,
}: CharactersModuleProperties) {
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
      <ModuleHeader
        title="Your Characters"
        icon={<Icon keyword="Characters" />}
      />
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {characters.map(character => (
          <CharacterBadge key={character.id} character={character} size="md" />
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
