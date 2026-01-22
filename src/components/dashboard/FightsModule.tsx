"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Box,
  Stack,
  Typography,
  Skeleton,
  CircularProgress,
} from "@mui/material"
import { FightBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ModuleHeader, ErrorModule } from "@/components/dashboard"
import { useClient, useCampaign } from "@/contexts"
import type { Fight } from "@/types"

interface FightsModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default function FightsModule({
  userId,
  size = "medium",
}: FightsModuleProps) {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const [fights, setFights] = useState<Fight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFetching = useRef(false)

  const fetchFights = useCallback(async () => {
    if (isFetching.current) return
    isFetching.current = true

    try {
      const response = await client.getFights({
        user_id: userId,
        at_a_glance: true,
        per_page: 5,
        sort: "created_at",
        order: "desc",
      })
      setFights(response.data?.fights || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching fights:", err)
      setError("Failed to load fights.")
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [client, userId])

  // Fetch on mount
  useEffect(() => {
    fetchFights()
  }, [fetchFights])

  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("fights", data => {
      if (data === "reload") {
        fetchFights()
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchFights])

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
        title="Your Fights"
        message={error}
        icon={<Icon keyword="Fights" />}
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
      <ModuleHeader title="Your Fights" icon={<Icon keyword="Fights" />} />
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {fights.map(fight => (
          <FightBadge key={fight.id} fight={fight} size={abbrevSize} />
        ))}
      </Stack>
      <Typography variant="body2">
        <Link
          href="/fights"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          All fights
        </Link>
      </Typography>
    </Box>
  )
}
