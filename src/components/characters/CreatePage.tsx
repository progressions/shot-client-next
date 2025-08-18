"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Box, Typography } from "@mui/material"
import { HeroTitle, Carousel } from "@/components/ui"
import { Template, SpeedDial } from "@/components/characters"
import { ConfirmDialog } from "@/components/ui"
import { useClient } from "@/contexts"
import type { Character } from "@/types"

type CreatePageProps = {
  templates?: Character[]
}

export default function CreatePage({ templates: templates }: CreatePageProps) {
  const router = useRouter()
  const { client } = useClient()
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
      router.push(`/characters/${newCharacter.id}`)
    } catch (error_) {
      console.error("Failed to duplicate character:", error_)
    }
  }

  if (!templates?.length) return null

  return (
    <Box sx={{ position: "relative" }}>
      <SpeedDial />
      <HeroTitle>Create</HeroTitle>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Choose your Archetype:
      </Typography>
      <Carousel items={items} onSelect={handleSelect} />
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
