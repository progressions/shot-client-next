"use client"

import { MiniButton } from "../MiniButton"
import { SystemStyleObject, Theme } from "@mui/system"

type DeleteButtonProps = {
  onClick?: () => void
  sx?: SystemStyleObject<Theme>
}

export function DeleteButton({ onClick, sx = {} }: DeleteButtonProps) {
  return (
    <MiniButton
      className="action-button"
      variant="contained"
      size="mini"
      color="error"
      sx={{
        opacity: 0,
        transition: "opacity 0.2s",
        ...sx,
      }}
      onClick={onClick}
    >
      Delete
    </MiniButton>
  )
}
