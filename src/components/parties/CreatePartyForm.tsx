"use client"

import PartyForm from "./PartyForm"

interface CreatePartyFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreatePartyForm({
  open,
  onClose,
}: CreatePartyFormProperties) {
  return <PartyForm open={open} onClose={onClose} title="New Party" />
}
