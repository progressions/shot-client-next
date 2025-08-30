"use client"

import { useState } from "react"
import type { Entity } from "@/types"
import { ListManager } from "@/components/ListManager"
import { ManageButton } from "../ManageButton"
import { SectionHeader } from "../SectionHeader"
import { Box } from "@mui/material"

type ManagerProperties = {
  icon: React.ReactNode
  title: string
  description: React.ReactNode
  parentEntity: Entity
  childEntityName:
    | "Character"
    | "Schtick"
    | "Weapon"
    | "Vehicle"
    | "Fight"
    | "Party"
    | "Juncture"
  onListUpdate: (entity: Entity) => Promise<void>
  excludeIds?: string[]
  manage?: boolean
}

export function Manager({
  icon,
  parentEntity,
  childEntityName,
  title,
  description,
  onListUpdate,
  excludeIds = [],
  manage = true,
}: ManagerProperties) {
  const [open, setOpen] = useState(false)

  const actionButton = manage ? (
    <ManageButton open={open} onClick={setOpen} />
  ) : null

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
        childEntityName={childEntityName}
        onListUpdate={onListUpdate}
        excludeIds={excludeIds}
        manage={manage}
      />
    </Box>
  )
}
