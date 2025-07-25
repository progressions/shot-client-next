"use client"

import { useEffect } from "react"
import { Box } from "@mui/material"
import { useCampaign } from "@/contexts"
import { FightName, FightDescription } from "@/components/fights"
import type { Fight } from "@/types/types"
import type { SystemStyleObject, Theme } from "@mui/system"

interface FightPageClientProps {
  fight: Fight
}

export default function FightPageClient({ fight }: FightPageClientProps) {
  useEffect(() => {
    document.title = fight.name || "Chi War"
  }, [fight.name])

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
      }}
    >
      <FightName
        fight={fight}
        sx={{
          fontSize: { xs: "1.25rem", md: "1.5rem" } as SystemStyleObject<Theme>,
          mb: { xs: 1, md: 2 },
        }}
      />
      <FightDescription fight={fight} sx={{ mb: { xs: 1, md: 2 } }} />
    </Box>
  )
}
