"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Chip,
} from "@mui/material"
import {
  FaPersonRunning,
  FaSkull,
  FaHeartPulse,
  FaCarBurst,
  FaArrowUp,
  FaBolt,
  FaCrosshairs,
} from "react-icons/fa6"
import { useEncounter, useClient } from "@/contexts"
import type { FightEvent } from "@/types"

type FightEventsDialogProps = {
  open: boolean
  onClose: () => void
}

// Map event types to icons
const eventTypeIcons: Record<string, React.ReactNode> = {
  movement: <FaPersonRunning />,
  wound_threshold: <FaHeartPulse />,
  up_check: <FaArrowUp />,
  out_of_fight: <FaSkull />,
  chase_action: <FaCarBurst />,
  boost: <FaBolt />,
  attack: <FaCrosshairs />,
}

// Map event types to colors
const eventTypeColors: Record<
  string,
  "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"
> = {
  movement: "default",
  wound_threshold: "warning",
  up_check: "info",
  out_of_fight: "error",
  chase_action: "secondary",
  boost: "success",
  attack: "primary",
}

function formatEventType(type: string): string {
  return type
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export default function FightEventsDialog({
  open,
  onClose,
}: FightEventsDialogProps) {
  const { encounter } = useEncounter()
  const { client } = useClient()
  const [events, setEvents] = useState<FightEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      if (!open || !encounter?.id) return

      setLoading(true)
      setError(null)

      try {
        const response = await client.getFightEvents(encounter.id)
        setEvents(response.data)
      } catch (err) {
        console.error("Error fetching fight events:", err)
        setError("Failed to load fight events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [open, encounter?.id, client])

  const getEventIcon = (eventType: string) => {
    return eventTypeIcons[eventType] || <FaCrosshairs />
  }

  const getEventColor = (eventType: string) => {
    return eventTypeColors[eventType] || "default"
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Fight Events</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : events.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No events recorded for this fight yet
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 400, overflow: "auto" }}>
              {events.map((event, index) => (
                <ListItem
                  key={event.id || index}
                  sx={{
                    py: 1,
                    px: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    alignItems: "flex-start",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                    {getEventIcon(event.event_type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Chip
                          label={formatEventType(event.event_type)}
                          size="small"
                          color={getEventColor(event.event_type)}
                          variant="outlined"
                        />
                        {event.created_at && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: "auto" }}
                          >
                            {formatTimestamp(event.created_at)}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.primary">
                        {event.description}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
