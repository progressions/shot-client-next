"use client"

import { Button } from "@mui/material"
import { SystemStyleObject, Theme } from "@mui/system"

type RepositionButtonProps = {
  onClick: () => void
  className?: string
  size?: "mini" | "small" | "medium" | "large"
  sx?: SystemStyleObject<Theme>
}

export function RepositionButton({
  onClick,
  className,
  size,
  sx: initialSx,
}: RepositionButtonProps) {
  const sx =
    size === "mini"
      ? {
          ...initialSx,
          fontSize: "0.75rem",
          padding: "4px 8px",
          minWidth: "auto",
          lineHeight: "1.2",
        }
      : initialSx
  return (
    <Button
      className={className}
      variant="contained"
      size="small"
      sx={{
        ...sx,
      }}
      onClick={onClick}
    >
      Reposition
    </Button>
  )
}
