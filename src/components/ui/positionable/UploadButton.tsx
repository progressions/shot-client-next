"use client"

import { MiniButton } from "../MiniButton"
import { SystemStyleObject, Theme } from "@mui/system"

type UploadButtonProps = {
  onClick?: () => void
  sx?: SystemStyleObject<Theme>
}

export function UploadButton({ onClick, sx = {} }: UploadButtonProps) {
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
      Upload
    </MiniButton>
  )
}
