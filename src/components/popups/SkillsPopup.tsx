import { Box, Typography } from "@mui/material"
import type { SkillValue } from "@/types"

interface SkillsPopupProperties {
  id: string
  data?: SkillValue[]
}

export default function SkillsPopup({ data }: SkillsPopupProperties) {
  const skillValues = data || []

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6">Skills</Typography>
      <Box pt={2}>
        {skillValues.map(([name, value]: SkillValue) => {
          return (
            <Typography key={name} gutterBottom>
              <strong>{name}</strong>:
              <Typography component="span">{value}</Typography>
            </Typography>
          )
        })}
      </Box>
    </Box>
  )
}
