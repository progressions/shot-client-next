"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Stack, Alert, Typography, Box } from "@mui/material"
import type { Juncture } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { EditJunctureForm } from "@/components/junctures"
import { useClient } from "@/contexts"
import { HeroImage, SpeedDialMenu } from "@/components/ui"
import { CharacterManager } from "@/components/characters"
import { InfoLink } from "@/components/links"

interface JuncturePageClientProperties {
  juncture: Juncture
}

export default function JuncturePageClient({
  juncture: initialJuncture,
}: JuncturePageClientProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [juncture, setJuncture] = useState<Juncture>(initialJuncture)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = juncture.name ? `${juncture.name} - Chi War` : "Chi War"
  }, [juncture.name])

  useEffect(() => {
    if (
      campaignData?.juncture &&
      campaignData.juncture.id === initialJuncture.id
    ) {
      setJuncture(campaignData.juncture)
    }
  }, [campaignData, initialJuncture])

  async function updateJuncture(junctureId: string, formData: FormData) {
    try {
      const response = await client.updateJuncture(junctureId, formData)
      setJuncture(response.data)
    } catch (error) {
      console.error("Error updating juncture:", error)
      throw error
    }
  }

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!juncture?.id) return
    if (
      !confirm(
        `Are you sure you want to delete the juncture: ${juncture.name}?`
      )
    )
      return

    try {
      await client.deleteJuncture(juncture)
      redirect("/junctures")
    } catch (error_) {
      console.error("Failed to delete juncture:", error_)
      setError("Failed to delete juncture.")
    }
  }

  const replaceJuncture = (updatedJuncture: Juncture) => {
    setJuncture(updatedJuncture)
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
        <Typography variant="h4">{juncture.name}</Typography>
      </Box>
      <HeroImage entity={juncture} setEntity={setJuncture} />
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={juncture.description}
          html={juncture.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>

      <Stack direction="column" spacing={2}>
        <CharacterManager
          name="juncture"
          title="Juncture Natives"
          description={
            <>
              <InfoLink href="/characters" info="Characters" /> born into a
              specific <InfoLink href="/junctures" info="Juncture" /> often
              travel through the <InfoLink info="Netherworld" />, participating
              in the <InfoLink info="Chi War" />, enaging in its conflicts and
              shaping its outcomes.
            </>
          }
          entity={juncture}
          characters={juncture.characters}
          character_ids={juncture.character_ids}
          update={updateJuncture}
          setEntity={replaceJuncture}
        />
      </Stack>

      <EditJunctureForm
        key={JSON.stringify(juncture)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        juncture={juncture}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
