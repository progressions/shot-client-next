import type { Schtick } from "@/types"
import { Stack, Typography, Chip } from "@mui/material"

type CategoryPathProps = {
  schtick: Schtick
}

export default function CategoryPath({ schtick }: CategoryPathProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
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
    </Stack>
  )
}
