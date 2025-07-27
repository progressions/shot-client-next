"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardMedia, Box, Alert, IconButton, Tooltip, Typography } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import type { Site } from "@/types/types"
import Link from "next/link"
import { SiteName, SiteDescription } from "@/components/sites"
import { useCampaign, useClient } from "@/contexts"
import { CharacterName } from "@/components/characters"

interface SiteDetailProps {
  site: Site
  onDelete: (siteId: string) => void
  onEdit: (site: Site) => void
}

export default function SiteDetail({ site: initialSite, onDelete, onEdit }: SiteDetailProps) {
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
    if (!confirm(`Are you sure you want to delete the site: ${site.name}?`)) return

    try {
      await client.deleteSite(site)
      onDelete(site.id)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete site")
      console.error("Delete site error:", err)
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
        hour12: true
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            <Link href={`/sites/${site.id}`} style={{ color: "#fff" }}>
              <SiteName site={site} />
            </Link>
          </Typography>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <Tooltip title="Edit Site">
              <IconButton
                color="inherit"
                onClick={handleEdit}
                size="small"
                aria-label="edit site"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Site">
              <IconButton
                color="inherit"
                onClick={handleDelete}
                size="small"
                aria-label="delete site"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <SiteDescription site={site} />
        <Typography variant="body2" sx={{ mt: 1, color: "#ffffff" }}>
          {site.characters && site.characters.length > 0 ? (
            site.characters.map((actor, index) => (
              <span key={`${actor.id}-${index}`}>
                <Link href={`/characters/${actor.id}`} style={{ color: "#ffffff", textDecoration: "underline" }}>
                  <CharacterName character={actor} />
                </Link>
                {index < site.characters.length - 1 && ", "}
              </span>
            ))
          ) : null }
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
