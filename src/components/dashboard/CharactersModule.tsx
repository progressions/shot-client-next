import { Box, Stack, Typography } from "@mui/material"
import { getServerClient } from "@/lib/getServerClient"
import { CharacterBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ModuleHeader } from "@/components/dashboard"
import type { Character } from "@/types"

interface CharactersModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default async function CharactersModule({
  userId,
  size = "medium",
}: CharactersModuleProps) {
  const client = await getServerClient()
  if (!client) {
    throw new Error("Failed to initialize client")
  }

  const charactersResponse = await client.getCharacters({
    user_id: userId,
    per_page: 5,
    sort: "created_at",
    order: "desc",
  })
  const characters: Character[] = charactersResponse.data?.characters || []

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
        icon={<Icon keyword="Character" />}
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
