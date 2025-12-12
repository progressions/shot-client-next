import React from "react"
import { Badge, CircularProgress } from "@mui/material"
import { styled } from "@mui/material/styles"

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    padding: 0,
    minWidth: "20px",
    height: "20px",
    borderRadius: "50%",
    right: 4,
    top: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 0 0 2px ${theme.palette.background.default}`,
  },
}))

interface ExtendingBadgeProps {
  extending: boolean
  children: React.ReactNode
  className?: string
}

export default function ExtendingBadge({
  extending,
  children,
  className,
}: ExtendingBadgeProps) {
  if (!extending) {
    return <>{children}</>
  }

  return (
    <StyledBadge
      badgeContent={<CircularProgress size={14} thickness={5} />}
      overlap="circular"
      className={className}
    >
      {children}
    </StyledBadge>
  )
}
