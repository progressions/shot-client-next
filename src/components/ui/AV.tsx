"use client"

import { Box, useMediaQuery } from "@mui/material"
import { useTheme } from "@mui/material/styles"

type AVProps = {
  label: string
  value: number | string
  maxValue?: number
  change?: number
}

// Mobile abbreviations for common action values
const mobileLabels: Record<string, string> = {
  "Martial Arts": "MA",
  Guns: "Guns",
  Sorcery: "Sorc",
  Creature: "Creat",
  Defense: "Def",
  Toughness: "Tough",
  Speed: "Spd",
  Damage: "Dmg",
  Fortune: "Fort",
  Magic: "Mag",
  Chi: "Chi",
}

export function AV({ label, value, maxValue, change }: AVProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  if (value === null || value === undefined) return null
  
  // Don't show values less than 7 (except for Fortune which can be 0)
  const numValue = typeof value === 'string' ? parseInt(value) : value
  if (label !== "Fortune" && label !== "Chi" && label !== "Magic" && !isNaN(numValue) && numValue < 7) {
    return null
  }

  const getChangeColor = () => {
    if (!change || change === 0) return "inherit"
    return change > 0 ? "success.main" : "error.main"
  }

  const displayLabel = isMobile ? mobileLabels[label] || label : label
  const changeColor = getChangeColor()

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0.5,
        minWidth: { xs: "auto", sm: "auto" },
      }}
    >
      <Box
        component="strong"
        sx={{
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
          color: changeColor,
        }}
      >
        {displayLabel}
      </Box>
      <Box
        component="span"
        sx={{
          color: changeColor,
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
          fontWeight: 500,
        }}
      >
        {maxValue ? `${value}/${maxValue}` : value}
      </Box>
    </Box>
  )
}
