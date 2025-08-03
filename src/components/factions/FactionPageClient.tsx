"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Stack, Alert, Typography, Box } from "@mui/material"
import type { Faction } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import {
  JuncturesList,
  SitesList,
  PartiesList,
  EditFactionForm,
} from "@/components/factions"
import { useClient } from "@/contexts"
import { HeroImage, SpeedDialMenu } from "@/components/ui"
import { CharacterManager } from "@/components/characters"
import { InfoLink } from "@/components/links"

interface FactionPageClientProperties {
  faction: Faction
}

export default function FactionPageClient({
  faction: initialFaction,
}: FactionPageClientProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [faction, setFaction] = useState<Faction>(initialFaction)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = faction.name ? `${faction.name} - Chi War` : "Chi War"
  }, [faction.name])

  useEffect(() => {
    if (
      campaignData?.faction &&
      campaignData.faction.id === initialFaction.id
    ) {
      setFaction(campaignData.faction)
    }
  }, [campaignData, initialFaction])

  async function updateFaction(factionId: string, formData: FormData) {
    try {
      const response = await client.updateFaction(factionId, formData)
      setFaction(response.data)
    } catch (error) {
      console.error("Error updating faction:", error)
      throw error
    }
  }

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!faction?.id) return
    if (
      !confirm(`Are you sure you want to delete the faction: ${faction.name}?`)
    )
      return

    try {
      await client.deleteFaction(faction)
      redirect("/factions")
    } catch (error_) {
      console.error("Failed to delete faction:", error_)
      setError("Failed to delete faction.")
    }
  }

  const replaceFaction = (faction: Faction) => {
    setFaction(faction)
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
        <Typography variant="h4">{faction.name}</Typography>
      </Box>
      <HeroImage entity={faction} setEntity={setFaction} />
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={faction.description}
          html={faction.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>

      <Stack direction="column" spacing={2}>
        <CharacterManager
          name="faction"
          title="Attuned Characters"
          description={
            <>
              A <InfoLink href="/factions" info="Faction" /> recruits{" "}
              <InfoLink href="/characters" info="Characters" /> to join its
              cause, acting as a unified force in the world of the{" "}
              <InfoLink info="Chi War" />.
            </>
          }
          entity={faction}
          characters={faction.characters}
          character_ids={faction.character_ids}
          update={updateFaction}
          setEntity={replaceFaction}
        />
        <PartiesList faction={faction} setFaction={replaceFaction} />
        <SitesList faction={faction} setFaction={replaceFaction} />
        <JuncturesList faction={faction} setFaction={replaceFaction} />
      </Stack>

      <EditFactionForm
        key={JSON.stringify(faction)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        faction={faction}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
