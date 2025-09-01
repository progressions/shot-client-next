import { Box } from "@mui/material"

type AVProps = {
  label: string
  value: number | string
  maxValue?: number
}

export function AV({ label, value, maxValue }: AVProps) {
  if (value === null || value === undefined) return null

  return (
    <Box component="span">
      <strong>{label}</strong> {maxValue ? `${value} / ${maxValue}` : value}
    </Box>
  )
}
