"use client"

import { Button } from "@mui/material"
import { FormActions } from "@/reducers"

type ManageButtonProps = {
  open: boolean
  dispatchForm: (action: { type: string; name: string; value: boolean }) => void
}

export function ManageButton({ open, dispatchForm }: ManageButtonProps) {
  if (open) {
    return (
      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          dispatchForm({
            type: FormActions.UPDATE,
            name: "open",
            value: false,
          })
        }
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
      onClick={() =>
        dispatchForm({
          type: FormActions.UPDATE,
          name: "open",
          value: true,
        })
      }
      sx={{ px: 1.5 }}
    >
      Manage
    </Button>
  )
}
