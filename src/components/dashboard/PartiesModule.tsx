"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Box,
  Stack,
  Typography,
  Skeleton,
  CircularProgress,
} from "@mui/material"
import { PartyBadge } from "@/components/badges"
import Link from "next/link"
import { Icon } from "@/components/ui"
import { ModuleHeader, ErrorModule } from "@/components/dashboard"
import { useClient, useCampaign } from "@/contexts"
import type { Party } from "@/types"

interface PartiesModuleProps {
  userId: string | null
  size?: "small" | "medium" | "large"
}

export default function PartiesModule({
  userId,
  size = "medium",
}: PartiesModuleProps) {
  const { client } = useClient()
  const { subscribeToEntity } = useCampaign()
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isFetching = useRef(false)

  const fetchParties = useCallback(async () => {
    if (isFetching.current) return
    isFetching.current = true

    try {
      const response = await client.getParties({
        user_id: userId,
        per_page: 5,
        sort: "created_at",
        order: "desc",
        at_a_glance: true,
      })
      setParties(response.data?.parties || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching parties:", err)
      setError("Failed to load parties.")
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [client, userId])

  // Fetch on mount
  useEffect(() => {
    fetchParties()
  }, [fetchParties])

  // Subscribe to WebSocket updates
  // Note: Including fetchParties in deps causes resubscription on client/user change,
  // which is acceptable as these changes are infrequent
  useEffect(() => {
    const unsubscribe = subscribeToEntity("parties", data => {
      if (data === "reload") {
        fetchParties()
      }
    })
    return unsubscribe
  }, [subscribeToEntity, fetchParties])

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
        title="Your Parties"
        message={error}
        icon={<Icon keyword="Party" />}
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
      <ModuleHeader title="Your Parties" icon={<Icon keyword="Party" />} />
      <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
        {parties.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No parties yet.
          </Typography>
        ) : (
          parties.map(party => (
            <PartyBadge key={party.id} party={party} size={abbrevSize} />
          ))
        )}
      </Stack>
      <Typography variant="body2">
        <Link
          href="/parties"
          style={{ color: "#fff", textDecoration: "underline" }}
        >
          All parties
        </Link>
      </Typography>
    </Box>
  )
}
