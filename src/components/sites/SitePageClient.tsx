"use client"

import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Button, Stack, Alert, Typography, Box } from "@mui/material"
import type { Site } from "@/types"
import { RichTextRenderer } from "@/components/editor"
import { useCampaign } from "@/contexts"
import { MembersForm, EditSiteForm } from "@/components/sites"
import { useClient } from "@/contexts"
import { CharacterBadge } from "@/components/badges"
import { FactionLink } from "@/components/links"
import { SpeedDialMenu } from "@/components/ui"

interface SitePageClientProps {
  site: Site
}

export default function SitePageClient({
  site: initialSite,
}: SitePageClientProps) {
  const { campaignData } = useCampaign()
  const { client } = useClient()

  const [site, setSite] = useState<Site>(initialSite)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const [editOpen, setEditOpen] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    document.title = site.name ? `${site.name} - Chi War` : "Chi War"
  }, [site.name])

  useEffect(() => {
    if (campaignData?.site && campaignData.site.id === initialSite.id) {
      setSite(campaignData.site)
    }
  }, [campaignData, initialSite])

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

  const handleOpenMembers = () => {
    setMembersOpen(prev => !prev)
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
      {site.image_url && (
        <Box
          component="img"
          src={site.image_url}
          alt={site.name}
          sx={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            objectPosition: "50% 20%",
            mb: 2,
            display: "block",
            mx: "auto",
          }}
        />
      )}
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: { xs: 1, sm: 1.5 },
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Site Members
          </Typography>
        </Box>
        {membersOpen && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenMembers}
            sx={{ px: 2 }}
          >
            Close
          </Button>
        )}
        {!membersOpen && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenMembers}
            sx={{ px: 2 }}
          >
            Manage
          </Button>
        )}
      </Box>
      <MembersForm open={membersOpen} site={site} />
      {!membersOpen && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
            {site.characters && site.characters.length > 0
              ? site.characters.map((actor, index) => (
                  <CharacterBadge
                    key={`${actor.id}-${index}`}
                    character={actor}
                    sx={{ width: "100%", maxWidth: "100%" }}
                  />
                ))
              : null}
          </Stack>
        </Box>
      )}

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
