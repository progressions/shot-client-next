"use client"

import { MiniButton } from "../MiniButton"
import { SystemStyleObject, Theme } from "@mui/system"

type GenerateButtonProps = {
  onClick?: () => void
  sx?: SystemStyleObject<Theme>
}

export function GenerateButton({ onClick, sx = {} }: GenerateButtonProps) {
  return (
    <MiniButton
      className="action-button"
      variant="contained"
      size="mini"
      sx={{
        opacity: 0,
        transition: "opacity 0.2s",
        ...sx,
      }}
      onClick={onClick}
    >
      Generate
    </MiniButton>
  )
}
