"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Stack, Alert, Typography, Box } from "@mui/material"
import type { Fight } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useClient, useCampaign } from "@/contexts"
import { MembersList, VehiclesList, EditFightForm } from "@/components/fights"
import { HeroImage, SpeedDialMenu } from "@/components/ui"

interface FightPageClientProperties {
  fight: Fight
}

export default function FightPageClient({
  fight: initialFight,
}: FightPageClientProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [fight, setFight] = useState<Fight>(initialFight)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = fight.name ? `${fight.name} - Chi War` : "Chi War"
  }, [fight.name])

  useEffect(() => {
    if (campaignData?.fight && campaignData.fight.id === initialFight.id) {
      setFight(campaignData.fight)
    }
  }, [campaignData, initialFight])

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!fight?.id) return
    if (!confirm(`Are you sure you want to delete the fight: ${fight.name}?`))
      return

    try {
      await client.deleteFight(fight)
      handleMenuClose()
      redirect("/fights")
    } catch (error_) {
      console.error("Failed to delete fight:", error_)
      setError("Failed to delete fight.")
    }
  }

  const replaceFight = (fight: Fight) => {
    setFight(fight)
  }

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onEdit={() => setEditOpen(true)} onDelete={handleDelete} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="h4">{fight.name}</Typography>
      </Box>
      <HeroImage entity={fight} />
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={fight.description}
          html={fight.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>
      <Stack direction="column" spacing={2}>
        <MembersList fight={fight} setFight={replaceFight} />
        <VehiclesList fight={fight} setFight={replaceFight} />
      </Stack>

      <EditFightForm
        key={JSON.stringify(fight)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        fight={fight}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
