import type { Fight } from "@/types/types"
import { Box, Typography } from "@mui/material"
import { FightName } from "@/components/fights"
import Link from "next/link"

type FightsModuleProps = {
  fights: Fight[]
}

export default function FightsModule({ fights }: FightsModuleProps) {
  return (
    <Box sx={{ flexGrow: 1, width: { xs: "100%", sm: "auto" }, p: 2, borderRadius: 2, backgroundColor: "#1d1d1d" }}>
      <Typography variant="h6" gutterBottom>
        Fights
      </Typography>
      {fights.map(fight => (
        <Box key={fight.id} sx={{ mb: 1, p: 1, borderRadius: 1, backgroundColor: "#2d2d2d" }}>
          <Typography variant="body1">
            <Link href={`/fights/${fight.id}`} style={{ color: "#fff", textDecoration: "none" }}>
              <FightName fight={fight} />
            </Link>
          </Typography>
        </Box>
      ))}
      <Typography variant="body2">
        <Link href="/fights" style={{ color: "#fff", textDecoration: "underline" }}>
          All fights
        </Link>
      </Typography>
    </Box>
  )
}
