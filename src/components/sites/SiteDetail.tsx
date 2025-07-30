"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardMedia,
  Box,
  Alert,
  Typography,
} from "@mui/material"
import type { Site } from "@/types"
import Link from "next/link"
import { SiteDescription } from "@/components/sites"
import { useCampaign, useClient } from "@/contexts"
import { FactionLink, CharacterLink } from "@/components/links"
import DetailButtons from "@/components/DetailButtons"

interface SiteDetailProperties {
  site: Site
  onDelete: (siteId: string) => void
  onEdit: (site: Site) => void
}

export default function SiteDetail({
  site: initialSite,
  onDelete,
  onEdit,
}: SiteDetailProperties) {
  const { client } = useClient()
  const { campaignData } = useCampaign()
  const [error, setError] = useState<string | null>(null)
  const [site, setSite] = useState<Site>(initialSite)

  useEffect(() => {
    if (campaignData?.site && campaignData.site.id === initialSite.id) {
      setSite({
        ...initialSite,
        name: campaignData.site.name || initialSite.name,
        description: campaignData.site.description || initialSite.description,
        image_url: campaignData.site.image_url || initialSite.image_url,
      })
    }
  }, [campaignData, initialSite])

  const handleDelete = async () => {
    if (!site?.id) return
    if (!confirm(`Are you sure you want to delete the site: ${site.name}?`))
      return

    try {
      await client.deleteSite(site)
      onDelete(site.id)
      setError(null)
    } catch (error_) {
      setError(
        error_ instanceof Error ? error_.message : "Failed to delete site"
      )
      console.error("Delete site error:", error_)
    }
  }

  const handleEdit = () => {
    onEdit(site)
  }

  // Format created_at timestamp for display
  const formattedCreatedAt = site.created_at
    ? new Date(site.created_at).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
    : "Unknown"

  return (
    <Card sx={{ mb: 2, bgcolor: "#424242" }}>
      {site.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={site.image_url}
          alt={site.name}
          sx={{ objectFit: "cover" }}
        />
      )}
      <CardContent sx={{ p: "1rem" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <Link href={`/sites/${site.id}`} style={{ color: "#fff" }}>
              {site.name}
            </Link>
          </Typography>
          <DetailButtons
            name="site"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
        {site.faction && (
          <Typography
            variant="body1"
            sx={{
              textTransform: "lowercase",
              fontVariant: "small-caps",
              mb: 2,
              color: "#ffffff",
            }}
          >
            Controlled by <FactionLink faction={site.faction} />
          </Typography>
        )}
        <SiteDescription site={site} />
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          {site.characters && site.characters.length > 0
            ? site.characters.map((actor, index) => (
                <span key={`${actor.id}-${index}`}>
                  <CharacterLink character={actor} />
                  {index < site.characters.length - 1 && ", "}
                </span>
              ))
            : null}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          Created: {formattedCreatedAt}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
