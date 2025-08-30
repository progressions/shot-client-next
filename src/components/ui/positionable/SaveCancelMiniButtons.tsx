"use client"

import { Box } from "@mui/material"
import { SaveButton } from "../SaveButton"
import { CancelButton } from "../CancelButton"

type SaveCancelMiniButtonsProps = {
  onSave: () => void
  onCancel: () => void
  isSaving?: boolean
}

export function SaveCancelMiniButtons({
  onSave,
  onCancel,
  isSaving = false,
}: SaveCancelMiniButtonsProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 8,
        right: 8,
        display: "flex",
        gap: 1,
      }}
    >
      <SaveButton size="mini" onClick={onSave} disabled={isSaving} />
      <CancelButton
        variant="contained"
        size="mini"
        onClick={onCancel}
        disabled={isSaving}
      />
    </Box>
  )
}
