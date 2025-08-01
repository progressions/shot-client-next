"use client"

import { useState, useEffect } from "react"
import { Box, Typography } from "@mui/material"
import { HeroTitle, Carousel } from "@/components/ui"
import { Template, SpeedDial } from "@/components/characters"
import { useClient } from "@/contexts"
import type { Character } from "@/types"

type CreatePageProps = {
  templates?: Character[]
}

export default function CreatePage({ templates: templates }: CreatePageProps) {
  const { client } = useClient()

  if (!templates?.length) return

  const handleSelect = (template: Character) => {
    console.log("Selected template:", template)
  }

  const items = templates.map(template => ({
    id: template.id,
    content: <Template template={template} />,
  }))

  return (
    <Box sx={{ position: "relative" }}>
      <SpeedDial />
      <HeroTitle>Create</HeroTitle>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Choose your Archetype:
      </Typography>
      <Box>
        <Carousel items={items} onSelect={handleSelect} />
      </Box>
    </Box>
  )
}
