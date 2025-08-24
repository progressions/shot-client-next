"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Box, Typography } from "@mui/material"
import { HeroTitle, Carousel } from "@/components/ui"
import { Template, SpeedDial } from "@/components/characters"
import { ConfirmDialog } from "@/components/ui"
import { useClient, useApp } from "@/contexts"
import type { Character } from "@/types"

type CreatePageProps = {
  templates?: Character[]
}

export default function CreatePage({ templates: templates }: CreatePageProps) {
  const router = useRouter()
  const { client } = useClient()
  const { refreshUser } = useApp()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Character | null>(
    null
  )

  const items = useMemo(
    () =>
      templates.map(template => ({
        id: template.id,
        content: <Template template={template} />,
      })),
    [templates]
  )

  const handleSelect = item => {
    const template = templates.find(t => t.id === item.id)
    if (template) {
      setSelectedTemplate(template)
      setDialogOpen(true)
    }
  }

  const handleConfirm = async () => {
    if (selectedTemplate) {
      await handleDuplicate(selectedTemplate)
    }
    setDialogOpen(false)
    setSelectedTemplate(null)
  }

  const handleClose = () => {
    setDialogOpen(false)
    setSelectedTemplate(null)
  }

  const handleDuplicate = async (character: Character) => {
    if (!character?.id) return
    try {
      const response = await client.duplicateCharacter(character)
      const newCharacter = response.data
      
      // Refresh user data to update onboarding progress
      await refreshUser()
      
      router.push(`/characters/${newCharacter.id}`)
    } catch (error_) {
      console.error("Failed to duplicate character:", error_)
    }
  }

  return (
    <Box sx={{ position: "relative" }}>
      <SpeedDial />
      <HeroTitle>Create</HeroTitle>
      {!templates?.length ? (
        <Box sx={{ mt: 4, p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No character templates available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Character templates need to be created in the database with is_template: true
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Choose your Archetype:
          </Typography>
          <Carousel items={items} onSelect={handleSelect} />
        </>
      )}
      <ConfirmDialog
        open={dialogOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Confirm Character Creation"
      >
        <Typography>
          Create a character based on the &quot;{selectedTemplate?.name || ""}
          &quot; archetype?
        </Typography>
      </ConfirmDialog>
    </Box>
  )
}
