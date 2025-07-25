"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box, Button, Typography, Container, Alert } from "@mui/material"
import { FightDetail, CreateFightForm, EditFightForm } from "@/components/fights"
import type { Fight } from "@/types/types"
import { FormActions, useForm } from "@/reducers"
import { useCampaign, useClient } from "@/contexts"

interface FightsProps {
  initialFights: Fight[]
}

type FormData = {
  fights: Fight[]
  drawerOpen: boolean
  error: string | null
}

export default function Fights({ initialFights }: FightsProps) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const { formState, dispatchForm } = useForm<FormData>({
    fights: initialFights,
    drawerOpen: false,
    error: null
  })
  const { formData } = formState
  const { fights, drawerOpen, error } = formData
  const [selectedFight, setSelectedFight] = useState<Fight | null>(null)
  const router = useRouter()

  const fetchFights = async () => {
    try {
      const response = await client.getFights()
      console.log("Fetched fights:", response.data.fights)
      dispatchForm({ type: FormActions.UPDATE, name: "fights", value: response.data.fights })
      dispatchForm({ type: FormActions.ERROR, payload: null })
    } catch (err: unknown) {
      dispatchForm({
        type: FormActions.ERROR,
        payload: err instanceof Error ? err.message : "Failed to fetch fights"
      })
      console.error("Fetch fights error:", err)
    }
  }

  useEffect(() => {
    if (!campaignData) return
    console.log("Campaign data:", campaignData)
    if (campaignData.fights === "reload") {
      fetchFights()
    }
  }, [client, campaignData, dispatchForm])

  const handleOpenCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: true })
  }

  const handleCloseCreateDrawer = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "drawerOpen", value: false })
  }

  const handleSaveFight = async (newFight: Fight) => {
    dispatchForm({ type: FormActions.UPDATE, name: "fights", value: [newFight, ...fights] })
  }

  const handleDeleteFight = (fightId: string) => {
    dispatchForm({ type: FormActions.UPDATE, name: "fights", value: fights.filter((fight) => fight.id !== fightId) })
    if (selectedFight?.id === fightId) setSelectedFight(null)
    router.refresh()
  }

  const handleUpdateFight = async () => {
    try {
      const response = await client.getFights()
      dispatchForm({ type: FormActions.UPDATE, name: "fights", value: response.data.fights })
      dispatchForm({ type: FormActions.ERROR, payload: null })
      router.refresh()
    } catch (err: unknown) {
      dispatchForm({
        type: FormActions.ERROR,
        payload: err instanceof Error ? err.message : "Failed to fetch fights"
      })
      console.error("Fetch fights error:", err)
    }
  }

  const handleEditFight = (fight: Fight) => {
    setSelectedFight(fight)
  }

  const handleCloseEditFight = () => {
    setSelectedFight(null)
  }

  const handleSaveEditFight = (updatedFight: Fight) => {
    console.log("Saved fight:", updatedFight)
    dispatchForm({
      type: FormActions.UPDATE,
      name: "fights",
      value: fights.map((f) => (f.id === updatedFight.id ? updatedFight : f))
    })
    setSelectedFight(null)
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ color: "#ffffff" }}>
          Fights
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpenCreateDrawer}>
          Create Fight
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box>
        {fights.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#ffffff" }}>
            No fights available
          </Typography>
        ) : (
          fights.map((fight) => (
            <FightDetail
              key={fight.id}
              fight={fight}
              onDelete={handleDeleteFight}
              onUpdate={handleUpdateFight}
              onEdit={handleEditFight}
            />
          ))
        )}
      </Box>
      <CreateFightForm
        open={drawerOpen}
        onClose={handleCloseCreateDrawer}
        onSave={handleSaveFight}
      />
      {selectedFight && (
        <EditFightForm
          open={!!selectedFight}
          onClose={handleCloseEditFight}
          onSave={handleSaveEditFight}
          fight={selectedFight}
        />
      )}
    </Container>
  )
}
