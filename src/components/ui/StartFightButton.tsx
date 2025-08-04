"use client"
import type { Fight } from "@/types"
import { Button } from "@/components/ui"
import { Box, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useState, useEffect } from "react"

const StyledButton = styled(Button)({
  fontSize: "1.5rem",
  fontWeight: "bold",
  padding: "12px 24px",
  textTransform: "uppercase",
  borderRadius: "8px",
  backgroundColor: "#d32f2f",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#b71c1c"
  },
  zIndex: 2,
})

const StyledBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  justifyContent: "center",
  my: 2,
  padding: theme.spacing(2),
  borderRadius: "6px",
  position: "relative",
  zIndex: 1,
  "&.shimmer": {
    overflow: "hidden",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-100%",
      width: "100%",
      height: "100%",
      background: "linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
      animation: "shimmer 2s infinite"
    }
  },
  "@keyframes shimmer": {
    "0%": {
      transform: "translateX(-100%)"
    },
    "100%": {
      transform: "translateX(100%)"
    }
  }
}))

interface StartFightButtonProps {
  fight: Fight
  onClick: () => void
}

export const StartFightButton = ({ fight, onClick }: StartFightButtonProps) => {
  const [isShimmering, setIsShimmering] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShimmering(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (fight.started_at) return null

  return (
    <StyledBox className={isShimmering ? "shimmer" : ""}>
      <Typography gutterBottom>This fight has not started yet.</Typography>
      <StyledButton variant="contained" onClick={onClick}>
        Start Fight
      </StyledButton>
    </StyledBox>
  )
}
