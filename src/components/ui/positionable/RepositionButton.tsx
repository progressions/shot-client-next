"use client"

import { MiniButton } from "../MiniButton"
import { SystemStyleObject, Theme } from "@mui/system"

type RepositionButtonProps = {
  onClick?: () => void
  sx?: SystemStyleObject<Theme>
}

export function RepositionButton({ onClick, sx = {} }: RepositionButtonProps) {
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
      Reposition
    </MiniButton>
  )
}
