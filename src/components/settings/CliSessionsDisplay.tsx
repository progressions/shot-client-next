"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Alert,
  Chip,
  Stack,
} from "@mui/material"
import TerminalIcon from "@mui/icons-material/Terminal"
import ComputerIcon from "@mui/icons-material/Computer"
import { SectionHeader } from "@/components/ui"
import { useClient } from "@/contexts"
import type { CliSession } from "@/types/auth"
import { formatDistanceToNow } from "date-fns"

/**
 * CliSessionsDisplay shows the user's CLI authentication sessions.
 *
 * Displays a read-only list of CLI sessions with IP address,
 * user agent, and timestamps. Sessions are created when users
 * authenticate via the CLI browser flow.
 */
export default function CliSessionsDisplay() {
  const [sessions, setSessions] = useState<CliSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { client } = useClient()

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await client.listCliSessions()
      setSessions(response.data.cli_sessions)
    } catch (err) {
      console.error("Failed to fetch CLI sessions:", err)
      setError("Failed to load CLI sessions")
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  // Parse user agent to get a friendly name
  const parseUserAgent = (userAgent: string | null): string => {
    if (!userAgent) return "Unknown client"
    // Look for chiwar-cli or similar patterns
    if (userAgent.toLowerCase().includes("chiwar")) {
      const match = userAgent.match(/chiwar[^/]*\/?([\d.]+)?/i)
      if (match) {
        return match[1] ? `Chi War CLI v${match[1]}` : "Chi War CLI"
      }
    }
    // Truncate long user agents
    return userAgent.length > 50 ? `${userAgent.slice(0, 50)}...` : userAgent
  }

  if (isLoading) {
    return (
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="CLI Sessions"
          icon={<TerminalIcon />}
          sx={{ mb: 2 }}
        >
          Devices authenticated via the Chi War CLI.
        </SectionHeader>
        <Stack spacing={1}>
          <Skeleton variant="rectangular" height={60} />
          <Skeleton variant="rectangular" height={60} />
        </Stack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="CLI Sessions"
          icon={<TerminalIcon />}
          sx={{ mb: 2 }}
        >
          Devices authenticated via the Chi War CLI.
        </SectionHeader>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ mb: 4 }}>
      <SectionHeader
        title="CLI Sessions"
        icon={<TerminalIcon />}
        sx={{ mb: 2 }}
      >
        Devices authenticated via the Chi War CLI.
      </SectionHeader>

      {sessions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No CLI sessions found. Use <code>chiwar login</code> to authenticate
          from the command line.
        </Typography>
      ) : (
        <>
          <Chip
            label={`${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
            size="small"
            color="primary"
            sx={{ mb: 2 }}
          />
          <List disablePadding>
            {sessions.map(session => (
              <ListItem
                key={session.id}
                sx={{
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  mb: 1,
                  px: 2,
                }}
              >
                <ListItemIcon>
                  <ComputerIcon />
                </ListItemIcon>
                <ListItemText
                  primary={parseUserAgent(session.user_agent)}
                  secondary={
                    <Stack
                      component="span"
                      direction="row"
                      spacing={2}
                      sx={{ mt: 0.5 }}
                    >
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {session.ip_address || "Unknown IP"}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        Connected {formatDate(session.created_at)}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  )
}
