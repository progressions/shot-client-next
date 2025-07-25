"use client"

import { useState, useEffect } from "react"
import { Box } from "@mui/material"
import Link from "next/link"
import { useClient } from "@/contexts"
import { FightDetail } from "@/components/fights"

// Define Fight type based on your API (adjust as needed)
type Fight = {
  id: string
  name: string
  description?: string // Optional description
  // Add more fields like date, participants, etc.
}

export default function Fights({ initialFights }: { initialFights: Fight[] }) {
  const [fights, setFights] = useState<Fight[]>(initialFights)
  const { client } = useClient() // For future refetches

  // Future: Add sorting/filtering state and refetch logic here
  // e.g., useEffect(() => {
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
          <FightDetail key={fight.id} fight={fight} />
        ))
      )}
    </Box>
  )
}
