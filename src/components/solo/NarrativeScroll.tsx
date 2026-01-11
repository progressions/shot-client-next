"use client"

import { useRef, useEffect } from "react"
import { Box, Paper, Stack, Typography, Chip, Divider } from "@mui/material"
import {
  useSoloEncounter,
  NarrativeEvent,
} from "@/contexts/SoloEncounterContext"

interface NarrativeEventItemProps {
  event: NarrativeEvent
}

function NarrativeEventItem({ event }: NarrativeEventItemProps) {
  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 0.5, lineHeight: 1.6 }}>
        {event.narrative}
      </Typography>
      {event.mechanicalResult && (
        <Chip
          label={event.mechanicalResult}
          size="small"
          color={event.isHit ? "error" : "default"}
          sx={{ fontSize: "0.75rem" }}
        />
      )}
      <Divider sx={{ mt: 2 }} />
    </Box>
  )
}

export function NarrativeScroll() {
  const { narrative, currentTurn, isProcessing } = useSoloEncounter()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [narrative.length])

  return (
    <Paper
      ref={scrollRef}
      sx={{
        p: 2,
        height: { xs: "50vh", md: "70vh" },
        overflow: "auto",
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={2}>
        {narrative.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            The encounter has not yet begun...
          </Typography>
        ) : (
          narrative.map(event => (
            <NarrativeEventItem key={event.id} event={event} />
          ))
        )}

        {/* Turn indicator */}
        {currentTurn && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="h6"
              color={currentTurn === "player" ? "primary" : "text.secondary"}
              sx={{ fontWeight: "bold" }}
            >
              {currentTurn === "player" ? "YOUR TURN" : "NPC acting..."}
            </Typography>
          </Box>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            Processing...
          </Typography>
        )}
      </Stack>
    </Paper>
  )
}
