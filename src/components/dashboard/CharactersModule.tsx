"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Box,
  Stack,
  Typography,
  Skeleton,
  CircularProgress,
} from "@mui/material"
import { CharacterBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ModuleHeader, ErrorModule } from "@/components/dashboard"
import { useClient, useCampaign } from "@/contexts"
import type { Character } from "@/types"

interface CharactersModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default function CharactersModule({
  userId,
  size = "medium",
}: CharactersModuleProps) {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFetching = useRef(false)

  const fetchCharacters = useCallback(async () => {
    if (isFetching.current) return
    isFetching.current = true

    try {
      const response = await client.getCharacters({
        user_id: userId,
        per_page: 5,
        sort: "created_at",
        order: "desc",
        at_a_glance: true,
      })
      setCharacters(response.data?.characters || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching characters:", err)
      setError("Failed to load characters.")
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [client, userId])

  // Fetch on mount
  useEffect(() => {
    fetchCharacters()
  }, [fetchCharacters])

  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("characters", data => {
      if (data === "reload") {
        fetchCharacters()
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchCharacters])

  const sizeMap = {
    small: "sm",
    medium: "md",
    large: "lg",
  }
  const abbrevSize = sizeMap[size] || "md"

  if (loading) {
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
        <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
        <CircularProgress size={24} sx={{ color: "#fff", mb: 2 }} />
      </Box>
    )
  }

  if (error) {
    return (
      <ErrorModule
        title="Your Characters"
        message={error}
        icon={<Icon keyword="Character" />}
      />
    )
  }

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
