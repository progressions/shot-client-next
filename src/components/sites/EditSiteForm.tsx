"use client"

import { useClient } from "@/contexts"
import { type Site } from "@/types/types"
import SiteForm from "./SiteForm"

interface EditSiteFormProps {
  open: boolean
  onClose: () => void
  onSave: (updatedSite: Site) => void
  site: Site
}

export default function EditSiteForm({ open, onClose, onSave, site }: EditSiteFormProps) {
  const { client } = useClient()

  const handleSave = async (formData: FormData, siteData: Site) => {
    const updatedSiteData = {
      ...site,
      id: site.id,
      name: siteData.name,
      description: siteData.description,
    } as Site
    formData.set("site", JSON.stringify(updatedSiteData))
    const response = await client.updateSite(site.id as string, formData)
    onSave(response.data)
  }

  return (
    <SiteForm
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialFormData={{ name: site.name || "", description: site.description || "", image: null }}
      title="Edit Site"
      existingImageUrl={site.image_url}
    />
  )
}

