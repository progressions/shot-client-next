"use client"

import { useState, useEffect } from "react"
import { Typography, Box } from "@mui/material"
import { useCampaign } from "@/contexts"
import type { Fight } from "@/types/types"
import { RichTextRenderer } from "@/components/editor"
import Link from "next/link"

interface FightNameProps {
  fight: Fight
}

export default function FightName({ fight }: FightNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(fight.name)
  const [displayDescription, setDisplayDescription] = useState(fight.description || "") // Assuming Fight type has description; add to types if needed

  useEffect(() => {
    if (campaignData) {
      const updatedFight = campaignData?.fight
      if (updatedFight && updatedFight.id === fight.id) {
        if (updatedFight.name) {
          setDisplayName(updatedFight.name)
        }
        if (updatedFight.description) {
          setDisplayDescription(updatedFight.description)
        }
      }
    }
  }, [campaignData])

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ color: "#ffffff" }}>
        <Link href={`/fights/${fight.id}`} key={fight.id} sx={{color: "#fff"}}>
          {displayName}
        </Link>
      </Typography>
      <RichTextRenderer html={displayDescription} />
    </Box>
  )
}
