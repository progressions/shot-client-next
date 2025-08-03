"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Stack, Alert, Typography, Box } from "@mui/material"
import type { Site } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { EditSiteForm } from "@/components/sites"
import { useClient } from "@/contexts"
import { FactionLink } from "@/components/links"
import { HeroImage, SpeedDialMenu } from "@/components/ui"
import { CharacterManager } from "@/components/characters"
import { InfoLink } from "@/components/links"

interface SitePageClientProperties {
  site: Site
}

export default function SitePageClient({
  site: initialSite,
}: SitePageClientProperties) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [site, setSite] = useState<Site>(initialSite)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = site.name ? `${site.name} - Chi War` : "Chi War"
  }, [site.name])

  useEffect(() => {
    if (campaignData?.site && campaignData.site.id === initialSite.id) {
      setSite(campaignData.site)
    }
  }, [campaignData, initialSite])

  async function updateSite(siteId: string, formData: FormData) {
    try {
      const response = await client.updateSite(siteId, formData)
      setSite(response.data)
    } catch (error) {
      console.error("Error updating site:", error)
      throw error
    }
  }

  const handleSave = async () => {
    setEditOpen(false)
  }

  const handleDelete = async () => {
    if (!site?.id) return
    if (!confirm(`Are you sure you want to delete the site: ${site.name}?`))
      return

    try {
      await client.deleteSite(site)
      handleMenuClose()
      redirect("/sites")
    } catch (error_) {
      console.error("Failed to delete site:", error_)
      setError("Failed to delete site.")
    }
  }

  const replaceSite = (updatedSite: Site) => {
    setSite(updatedSite)
  }

  return (
    <Box
      sx={{
        mb: { xs: 1, md: 2 },
        position: "relative",
      }}
    >
      <SpeedDialMenu onEdit={() => setEditOpen(true)} onDelete={handleDelete} />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="h4">{site.name}</Typography>
      </Box>
      <HeroImage entity={site} setEntity={setSite} />
      {site.faction && (
        <Typography variant="h6">
          Belongs to <FactionLink faction={site.faction} />
        </Typography>
      )}
      <Box sx={{ p: 2, backgroundColor: "#2e2e2e", borderRadius: 1, my: 2 }}>
        <RichTextRenderer
          key={site.description}
          html={site.description || ""}
          sx={{ mb: 2 }}
        />
      </Box>
      <Stack direction="column" spacing={2}>
        <CharacterManager
          name="site"
          title="Attuned Characters"
          description={
            <>
              A <InfoLink href="/sites" info="Feng Shui Site" /> is a location
              whose energy flow produces powerful <InfoLink info="Chi" /> for
              those <InfoLink info="Attuned" /> to it.{" "}
            </>
          }
          entity={site}
          characters={site.characters}
          character_ids={site.character_ids}
          update={updateSite}
          setEntity={replaceSite}
        />
      </Stack>

      <EditSiteForm
        key={JSON.stringify(site)}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        site={site}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}
