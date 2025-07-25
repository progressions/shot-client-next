"use client"

import { useState, useEffect } from "react"
import { Typography, Box } from "@mui/material"
import type { Fight } from "@/types/types"
import { RichTextRenderer } from "@/components/editor"
import Link from "next/link"
import { FightName, FightDescription } from "@/components/fights"

interface FightDetailProps {
  fight: Fight
}

export default function FightDetail({ fight }: FightDetailProps) {

  return (
    <Box sx={{ mb: 2 }}>
      <Link href={`/fights/${fight.id}`} key={fight.id} style={{color: "#fff"}}>
        <FightName fight={fight} />
      </Link>
      <FightDescription fight={fight} />
    </Box>
  )
}
