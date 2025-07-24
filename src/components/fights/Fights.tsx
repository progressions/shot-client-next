"use client"

import { useState, useEffect } from "react"
import { Box } from "@mui/material"
import { useClient } from "@/contexts"
import { FightName } from "@/components/fights" // Import the new FightName component

// Define Fight type based on your API (adjust as needed)
type Fight = {
  id: string
  name: string // Or whatever properties your fights have
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
          <FightName key={fight.id} fight={fight} />
        ))
      )}
    </Box>
  )
}
