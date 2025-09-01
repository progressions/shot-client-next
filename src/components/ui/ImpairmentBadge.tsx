import React from "react"
import { Badge, Box } from "@mui/material"
import { styled } from "@mui/material/styles"

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontSize: "0.7rem",
    height: "18px",
    minWidth: "18px",
    padding: "0 4px",
    fontWeight: "bold",
    right: 8,
    top: 8,
  },
}))

interface ImpairmentBadgeProps {
  impairments: number
  children: React.ReactNode
  className?: string
}

export default function ImpairmentBadge({
  impairments,
  children,
  className,
}: ImpairmentBadgeProps) {
  if (!impairments || impairments <= 0) {
    return <>{children}</>
  }

  return (
    <Box sx={{ padding: "4px", display: "inline-flex" }}>
      <StyledBadge
        badgeContent={impairments}
        color="error"
        overlap="circular"
        className={className}
      >
        {children}
      </StyledBadge>
    </Box>
  )
}
