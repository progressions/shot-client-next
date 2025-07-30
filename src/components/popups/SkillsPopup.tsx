import { Box, Typography } from "@mui/material"
import type { SkillValue } from "@/types"

interface SkillsPopupProps {
  id: string
  data?: SkillValue[]
}

export default function SkillsPopup({ data }: SkillsPopupProps) {
  const skillValues = data || []

  return (
    <>
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
    </>
  )
}
