import { Box } from "@mui/material"

type AVProps = {
  label: string
  value: number | string
  maxValue?: number
  change?: number
}

export function AV({ label, value, maxValue, change }: AVProps) {
  if (value === null || value === undefined) return null

  const getChangeColor = () => {
    if (!change || change === 0) return "inherit"
    return change > 0 ? "success.main" : "error.main"
  }

  return (
    <Box component="span">
      <strong>{label}</strong>{" "}
      <Box component="span" sx={{ color: getChangeColor() }}>
        {maxValue ? `${value} / ${maxValue}` : value}
      </Box>
    </Box>
  )
}
