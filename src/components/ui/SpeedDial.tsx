"use client"

import { SpeedDialMenu } from "@/components/ui"
import { useState } from "react"

export const actions = []

type SpeedDialProps = {
  actions?: typeof actions
}

export function SpeedDial({
  actions: initialActions = actions,
}: SpeedDialProps) {
  const [open, setOpen] = useState(false)

  return (
    <SpeedDialMenu
      actions={initialActions}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    />
  )
}
