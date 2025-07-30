"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Stack, Alert, Typography, Box } from "@mui/material"
import type { Juncture } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { MembersList, EditJunctureForm } from "@/components/junctures"
import { useClient } from "@/contexts"
import { HeroImage, SpeedDialMenu } from "@/components/ui"

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
      console.log("Setting juncture from campaign data:", campaignData.juncture)
      setJuncture(campaignData.juncture)
    }
  }, [campaignData, initialJuncture])

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
      <HeroImage entity={juncture} />
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={juncture.description}
          html={juncture.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>

      <Stack direction="column" spacing={2}>
        <MembersList juncture={juncture} setJuncture={replaceJuncture} />
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
