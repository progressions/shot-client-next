"use client"

import SchtickForm from "./SchtickForm"

interface CreateSchtickFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreateSchtickForm({
  open,
  onClose,
}: CreateSchtickFormProperties) {
  return <SchtickForm open={open} onClose={onClose} title="New Schtick" />
}
