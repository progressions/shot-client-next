"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { Box, Stack, Typography } from "@mui/material"
import Link from "next/link"
import { useClient, useCampaign } from "@/contexts"
import { AdventureBadge } from "@/components/badges"
import { Icon } from "@/components/ui"
import { ModuleHeader } from "@/components/dashboard"
import type { Adventure } from "@/types"

interface AdventuresModuleClientProps {
  initialAdventures: Adventure[]
  userId: string | null
  size?: "sm" | "md" | "lg"
}

export default function AdventuresModuleClient({
  initialAdventures,
  userId,
  size = "md",
}: AdventuresModuleClientProps) {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const [adventures, setAdventures] = useState<Adventure[]>(initialAdventures)
  const isRefreshing = useRef(false)

  const fetchAdventures = useCallback(async () => {
    if (isRefreshing.current) return
    isRefreshing.current = true

    try {
      console.debug("[AdventuresModule] Fetching adventures via API")
      const response = await client.getAdventures({
        user_id: userId,
        per_page: 5,
        sort: "created_at",
        order: "desc",
        at_a_glance: true,
      })
      const newAdventures = response.data?.adventures || []
      console.debug(
        "[AdventuresModule] Fetched",
        newAdventures.length,
        "adventures"
      )
      setAdventures(newAdventures)
    } catch (error) {
      console.error("[AdventuresModule] Error fetching adventures:", error)
    } finally {
      setTimeout(() => {
        isRefreshing.current = false
      }, 1000)
    }
  }, [client, userId])

  useEffect(() => {
    const unsubscribe = subscribeToEntity("adventures", data => {
      console.debug("[AdventuresModule] WebSocket adventures event:", data)
      if (data === "reload") {
        fetchAdventures()
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchAdventures])

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        borderRadius: 2,
        backgroundColor: "#2d2d2d",
      }}
    >
      <ModuleHeader
        title="Your Adventures"
        icon={<Icon keyword="Adventure" />}
      />
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {adventures.map(adventure => (
          <AdventureBadge
            key={adventure.id}
            adventure={adventure}
            size={size}
          />
        ))}
      </Stack>
      <Typography variant="body2">
        <Link
          href="/adventures"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          All adventures
        </Link>
      </Typography>
    </Box>
  )
}
