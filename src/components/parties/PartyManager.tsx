"use client"

import { useState } from "react"
import type { Entity } from "@/types"
import { ListManager } from "@/components/ListManager"
import { ManageButton, SectionHeader } from "@/components/ui"
import { Box } from "@mui/material"

type PartyManagerProperties = {
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  parentEntity: Entity
  onListUpdate: (entity: Entity) => Promise<void>
}

export default function PartyManager({
  icon,
  parentEntity,
  title,
  description,
  onListUpdate,
}: PartyManagerProperties) {
  const [open, setOpen] = useState(false)

  const actionButton = <ManageButton open={open} onClick={setOpen} />

  return (
    <Box sx={{ my: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: { xs: 1, sm: 1.5 },
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <SectionHeader
          title={title}
          icon={icon}
          actions={actionButton}
          sx={{ width: "100%" }}
        >
          {description}
        </SectionHeader>
      </Box>
      <ListManager
        open={open}
        parentEntity={parentEntity}
        childEntityName="Party"
        onListUpdate={onListUpdate}
      />
    </Box>
  )
}
