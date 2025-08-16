"use client"

import { defaultSite, type Site } from "@/types"
import { useClient } from "@/contexts"
import SiteForm from "./SiteForm"

interface CreateSiteFormProperties {
  open: boolean
  onClose: () => void
  onSave: (newSite: Site) => void
}

export default function CreateSiteForm({
  open,
  onClose,
  onSave,
}: CreateSiteFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, siteData: Site) => {
    const site = { ...defaultSite, ...siteData } as Site
    formData.set("site", JSON.stringify(site))
    const response = await client.createSite(formData)
    onSave?.(response.data)
  }

  const defaultEntity = defaultSite

  return (
    <SiteForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...defaultEntity, image: null }}
      title="New Site"
    />
  )
}
