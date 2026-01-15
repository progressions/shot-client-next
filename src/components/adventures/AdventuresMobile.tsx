"use client"

import { Box } from "@mui/material"
import type { Adventure } from "@/types"
import { AdventureDetail } from "@/components/adventures"

interface AdventuresMobileProps {
  adventures: Adventure[]
  onDelete: (adventureId: string) => void
  onEdit: (adventure: Adventure) => void
}

export default function AdventuresMobile({
  adventures,
  onDelete,
  onEdit,
}: AdventuresMobileProps) {
  return (
    <Box>
      {adventures.map(adventure => (
        <AdventureDetail
          key={adventure.id}
          adventure={adventure}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </Box>
  )
}
