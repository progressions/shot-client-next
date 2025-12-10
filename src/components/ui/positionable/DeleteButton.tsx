"use client"

import { MiniButton } from "../MiniButton"
import { SystemStyleObject, Theme } from "@mui/system"

type DeleteButtonProps = {
  onClick?: () => void
  sx?: SystemStyleObject<Theme>
  disabled?: boolean
}

export function DeleteButton({
  onClick,
  sx = {},
  disabled = false,
}: DeleteButtonProps) {
  return (
    <MiniButton
      className="action-button"
      variant="contained"
      size="mini"
      color="error"
      disabled={disabled}
      sx={{
        opacity: 0,
        transition: "opacity 0.2s",
        ...sx,
      }}
      onClick={onClick}
    >
      {disabled ? "Deleting..." : "Delete"}
    </MiniButton>
  )
}
