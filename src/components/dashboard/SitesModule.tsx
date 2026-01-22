"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Box,
  Stack,
  Typography,
  Skeleton,
  CircularProgress,
} from "@mui/material"
import { SiteBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ModuleHeader, ErrorModule } from "@/components/dashboard"
import { useClient, useCampaign } from "@/contexts"
import type { Site } from "@/types"

interface SitesModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default function SitesModule({
  userId,
  size = "medium",
}: SitesModuleProps) {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFetching = useRef(false)

  const fetchSites = useCallback(async () => {
    if (isFetching.current) return
    isFetching.current = true

    try {
      const response = await client.getSites({
        user_id: userId,
        per_page: 5,
        sort: "created_at",
        order: "desc",
        at_a_glance: true,
      })
      setSites(response.data?.sites || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching sites:", err)
      setError("Failed to load sites.")
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [client, userId])

  // Fetch on mount
  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  // Subscribe to WebSocket updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("sites", data => {
      if (data === "reload") {
        fetchSites()
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchSites])

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
        title="Your Sites"
        message={error}
        icon={<Icon keyword="Site" />}
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
      <ModuleHeader title="Your Sites" icon={<Icon keyword="Site" />} />
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {sites.map(site => (
          <SiteBadge key={site.id} site={site} size={abbrevSize} />
        ))}
      </Stack>
      <Typography variant="body2">
        <Link
          href="/sites"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          All sites
        </Link>
      </Typography>
    </Box>
  )
}
