"use client"
import type { Entity } from "@/types"
import { Box, IconButton } from "@mui/material"
import { useEncounter } from "@/contexts"
import { Icon } from "@/components/ui"

type ActionsProps = {
  entity: Entity
}

export default function Actions({ entity }: ActionsProps) {
  const { ec } = useEncounter()

  const spendShots = async () => {
    await ec.spendShots(entity, 3)
  }

  return (
    <IconButton onClick={spendShots} sx={{ p: 1 }}>
      <Icon keyword="Actions" size={24} />
    </IconButton>
  )
}
