"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Stack, Alert, Typography, Box } from "@mui/material"
import type { Fight } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useClient, useCampaign } from "@/contexts"
import { VehiclesList, EditFightForm } from "@/components/fights"
import { HeroImage, SpeedDialMenu } from "@/components/ui"
import { CharacterManager } from "@/components/characters"
import { InfoLink } from "@/components/links"

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

  async function updateFight(fightId: string, formData: FormData) {
    try {
      const response = await client.updateFight(fightId, formData)
      setFight(response.data)
    } catch (error) {
      console.error("Error updating fight:", error)
      throw error
    }
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
        <CharacterManager
          name="fight"
          title="Fighters"
          description={
            <>
              A <InfoLink href="/fights" info="Fight" /> is a battle between{" "}
              <InfoLink href="/characters" info="Characters" />, with the stakes{" "}
              often involving control of a{" "}
              <InfoLink href="/sites" info="Feng Shui Site" />.
            </>
          }
          entity={fight}
          characters={fight.actors}
          character_ids={fight.character_ids}
          update={updateFight}
          setEntity={replaceFight}
        />
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
