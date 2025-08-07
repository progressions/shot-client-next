import { Stack, Box, Typography } from "@mui/material"
import Link from "next/link"
import type { Character } from "@/types"
import { CharacterBadge } from "@/components/badges"
import { Icon } from "@/components/ui"
import { ModuleHeader } from "@/components/dashboard"

type CharactersModuleProperties = {
  characters: Character[]
  size?: "small" | "medium" | "large"
}

export default function CharactersModule({
  characters,
  size = "medium",
}: CharactersModuleProperties) {
  const sizeMap = {
    small: "sm",
    medium: "md",
    large: "lg",
  }
  const abbrevSize = sizeMap[size] || "md"
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
          <CharacterBadge
            key={character.id}
            character={character}
            size={abbrevSize}
          />
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
