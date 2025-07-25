"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Button, Typography, Container } from "@mui/material"
import { FightDetail, CreateFightForm } from "@/components/fights"
import type { Fight } from "@/types/types"
import { FormActions, useForm } from "@/reducers"

interface FightsProps {
  initialFights: Fight[]
}

type FormData = {
  fights: Fight[]
  drawerOpen: boolean
}

export default function Fights({ initialFights }: FightsProps) {
  const { formState, dispatchForm, initialFormState } = useForm<FormData>({
    fights: initialFights,
    drawerOpen: false
  })
  const { formData } = formState
  const { fights, drawerOpen } = formData

  const router = useRouter()

  const handleOpenDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveFight = (newFight: Fight) => {
    dispatchForm({ type: FormActions.UPDATE, name: "fights", value: [newFight, ...fights] })
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
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
