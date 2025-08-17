"use client"

import SiteForm from "./SiteForm"

interface CreateSiteFormProperties {
  open: boolean
  onClose: () => void
}

export default function CreateSiteForm({
  open,
  onClose,
}: CreateSiteFormProperties) {
  return <SiteForm open={open} onClose={onClose} title="New Site" />
}
