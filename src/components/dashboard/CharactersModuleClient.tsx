"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { Box, Stack, Typography } from "@mui/material"
import { CharacterBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ModuleHeader } from "@/components/dashboard"
import { useCampaign, useClient } from "@/contexts"
import type { Character } from "@/types"

interface CharactersModuleClientProps {
  initialCharacters: Character[]
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default function CharactersModuleClient({
  initialCharacters,
  userId,
  size = "medium",
}: CharactersModuleClientProps) {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const [characters, setCharacters] = useState<Character[]>(initialCharacters)
  const isFetching = useRef(false)

  const sizeMap = {
    small: "sm",
    medium: "md",
    large: "lg",
  }
  const abbrevSize = sizeMap[size] || "md"

  const fetchCharacters = useCallback(async () => {
    if (isFetching.current) return
    isFetching.current = true
    try {
      const response = await client.getCharacters({
        user_id: userId,
        per_page: 5,
        sort: "created_at",
        order: "desc",
        cache_buster: "true",
      })
      setCharacters(response.data?.characters || [])
    } catch (error) {
      console.error("Error fetching characters:", error)
    } finally {
      isFetching.current = false
    }
  }, [client, userId])

  // Subscribe to character updates via WebSocket
  useEffect(() => {
    const unsubscribe = subscribeToEntity("characters", data => {
      if (data === "reload") {
        fetchCharacters()
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchCharacters])

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
