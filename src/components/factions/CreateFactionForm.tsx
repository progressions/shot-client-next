"use client"

import FactionForm from "./FactionForm"

interface CreateFactionFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreateFactionForm({
  open,
  onClose,
}: CreateFactionFormProperties) {
  return (
    <FactionForm
      open={open}
      onClose={onClose}
      title="New Faction"
    />
  )
}
