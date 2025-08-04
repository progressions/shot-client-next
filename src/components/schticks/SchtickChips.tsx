import type { Schtick } from "@/types"
import { Typography, Chip } from "@mui/material"
import { Chipset } from "@/components/ui"

type SchtickChipsProps = {
  schtick: Schtick
}

export default function SchtickChips({ schtick }: SchtickChipsProps) {
  return (
    <Chipset>
      <Typography variant="h6" sx={{ mb: 1 }}>
        <Chip
          size="medium"
          label={`Category: ${schtick.category}`}
          sx={{ backgroundColor: schtick.color }}
        />
      </Typography>
      {schtick.path && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          <Chip size="medium" label={`Path: ${schtick.path}`} />
        </Typography>
      )}
    </Chipset>
  )
}
