"use client"

import JunctureForm from "./JunctureForm"

interface CreateJunctureFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreateJunctureForm({
  open,
  onClose,
}: CreateJunctureFormProperties) {
  return <JunctureForm open={open} onClose={onClose} title="New Juncture" />
}
