"use client"

import { useClient } from "@/contexts"
import { type Site } from "@/types"
import SiteForm from "./SiteForm"

interface EditSiteFormProperties {
  open: boolean
  onClose: () => void
  onSave: (updatedSite: Site) => void
  site: Site
}

export default function EditSiteForm({
  open,
  onClose,
  onSave,
  site,
}: EditSiteFormProperties) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, siteData: Site) => {
    const updatedSiteData = {
      ...site,
      ...siteData,
    } as Site
    formData.set("site", JSON.stringify(updatedSiteData))
    const response = await client.updateSite(site.id, formData)
    onSave(response.data)
  }

  return (
    <SiteForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ ...site, image: null }}
      title="Edit Site"
      existingImageUrl={site.image_url}
    />
  )
}
