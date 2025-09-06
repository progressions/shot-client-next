"use client"
import { useEffect } from "react"
import { Box, Typography } from "@mui/material"
import { Alert } from "@/components/ui"
import { FightName } from "@/components/fights"
import { ShotCounter } from "@/components/encounters"
import { useEncounter } from "@/contexts"

export default function Encounter() {
  const { encounterState, encounter } = useEncounter()
  const { status } = encounterState

  useEffect(() => {
    document.title = encounter.name ? `${encounter.name} - Chi War` : "Chi War"
  }, [encounter.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <Typography variant="h4" component="h4" gutterBottom>
        <FightName fight={encounter} />
      </Typography>
      <Alert status={status} />
      <ShotCounter />
    </Box>
  )
}
