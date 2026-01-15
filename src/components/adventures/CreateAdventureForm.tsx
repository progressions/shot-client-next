"use client"

import AdventureForm from "./AdventureForm"

interface CreateAdventureFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreateAdventureForm({
  open,
  onClose,
}: CreateAdventureFormProperties) {
  return <AdventureForm open={open} onClose={onClose} title="New Adventure" />
}
