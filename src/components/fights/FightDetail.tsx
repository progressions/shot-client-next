"use client"

import { Card, CardContent } from "@mui/material" // Or via your ui/ wrapper
import type { Fight } from "@/types/types"
import Link from "next/link"
import { FightName, FightDescription } from "@/components/fights"

interface FightDetailProps {
  fight: Fight
}

export default function FightDetail({ fight }: FightDetailProps) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: "1rem" }}>
        <Link href={`/fights/${fight.id}`} key={fight.id} style={{ color: "#fff" }}>
          <FightName fight={fight} />
        </Link>
        <FightDescription fight={fight} />
      </CardContent>
    </Card>
  )
}
