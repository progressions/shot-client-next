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

  const items = templates.map(template => ({
    id: template.id,
    content: <Template template={template} />,
  }))
  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, position: "relative" }}>
      <SpeedDial />
      <HeroTitle>Create</HeroTitle>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Choose your Archetype:
      </Typography>
      <Box sx={{ width: 700 }}>
        <Carousel items={items} />
      </Box>
    </Box>
  )
}
