"use client"

import JunctureForm from "./JunctureForm"

interface CreateJunctureFormProperties {
  open: boolean
  onClose: () => void
  onJunctureCreated?: () => void
}

export default function CreateJunctureForm({
  open,
  onClose,
  onJunctureCreated,
}: CreateJunctureFormProperties) {
  return (
    <JunctureForm
      open={open}
      onClose={onClose}
      title="New Juncture"
      onJunctureCreated={onJunctureCreated}
    />
  )
}
