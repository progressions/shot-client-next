"use client"

import { MiniButton } from "@/components/ui"
import { SystemStyleObject, Theme } from "@mui/system"

type GenerateImageButtonProps = {
  onClick?: () => void
  sx?: SystemStyleObject<Theme>
}

export function GenerateImageButton({
  onClick,
  sx = {},
}: GenerateImageButtonProps) {
  return (
    <MiniButton
      className="action-button"
      variant="contained"
      size="mini"
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 0,
        transition: "opacity 0.2s",
        ...sx,
      }}
      onClick={onClick}
    >
      Generate Image
    </MiniButton>
  )
}
