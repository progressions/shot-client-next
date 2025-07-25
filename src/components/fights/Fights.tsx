"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Button, Typography, Container } from "@mui/material"
import { FightDetail, CreateFightForm } from "@/components/fights"
import type { Fight } from "@/types/types"

interface FightsProps {
  initialFights: Fight[]
}

export default function Fights({ initialFights }: FightsProps) {
  const [fights, setFights] = useState<Fight[]>(initialFights)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()

  const handleOpenDrawer = () => {
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
  }

  const handleSaveFight = (newFight: Fight) => {
    setFights([newFight, ...fights])
    setDrawerOpen(false)
    router.refresh() // Optional: Refresh server data if using SSR
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ color: "#ffffff" }}>
          Fights
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpenDrawer}>
          Create Fight
        </Button>
      </Box>
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
      <CreateFightForm
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveFight}
      />
    </Container>
  )
}
