"use client" // Client component to enable future interactivity

import { useState, useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { useClient } from "@/contexts"
import type { Fight } from "@/types/types"

type FightsProps = {
  initialFights: Fight[]
}

export default function Fights({ initialFights }: FightsProps) {
  const [fights, setFights] = useState<Fight[]>(initialFights)
  const { client } = useClient() // For future refetches

  // Future: Add sorting/filtering state and refetch logic here
  // e.g., useEffect to refetch when filters change:
  // useEffect(() => {
  //   async function refetch() {
  //     const { data } = await client.getFights({ sort: sortBy, filter: filter });
  //     setFights(data.fights);
  //   }
  //   refetch();
  // }, [sortBy, filter, client]);

  return (
    <Box>
      {fights.length === 0 ? (
        <Typography variant="body1" sx={{ color: "#ffffff" }}>
          No fights available
        </Typography>
      ) : (
        fights.map((fight) => (
          <Typography key={fight.id} variant="body1" sx={{ color: "#ffffff", mb: 1 }}>
            {fight.name} {/* Adjust to display relevant fight details */}
          </Typography>
        ))
      )}
    </Box>
  )
}
