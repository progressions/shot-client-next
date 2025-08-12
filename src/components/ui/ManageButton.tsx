"use client"

import { Button } from "@mui/material"

type ManageButtonProps = {
  open: boolean
  onClick: (value: boolean) => void
}

export function ManageButton({ open, onClick }: ManageButtonProps) {
  if (open) {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() => onClick(false)}
        size="small"
        sx={{ px: 1.5 }}
      >
        Close
      </Button>
    )
  }

  return (
    <Button
      variant="contained"
      color="primary"
      size="small"
      onClick={() => onClick(true)}
      sx={{ px: 1.5 }}
    >
      Manage
    </Button>
  )
}
