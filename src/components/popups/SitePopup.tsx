import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, Site } from "@/types"
import { defaultSite } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { SiteAvatar } from "@/components/avatars"
import { useClient } from "@/contexts"
import { MembersGroup, FactionLink, SiteLink } from "@/components/ui"

export default function SitePopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [site, setSite] = useState<Site>(defaultSite)

  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await client.getSite({ id })
        const fetchedSite = response.data
        console.log("Fetched site:", fetchedSite)
        if (fetchedSite) {
          setSite(fetchedSite)
        } else {
          console.error(`Site with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching site:", error)
      }
    }

    if (user?.id && id) {
      fetchSite().catch(error => {
        console.error("Failed to fetch site:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null // Use null instead of <></> for consistency
  }

  if (!site?.id) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2">Loading...</Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Box>
    )
  }
  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <SiteAvatar site={site} disablePopup={true} />
        <Typography>
          <SiteLink site={site} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography
        component="div"
        variant="caption"
        sx={{ textTransform: "uppercase" }}
      >
        {site.faction && (
          <>
            <FactionLink faction={site.faction} />
          </>
        )}
      </Typography>
      <Typography>
        {site.characters && site.characters.length > 0 && (
          <>
            {site.characters.length} member
            {site.characters.length !== 1 ? "s" : ""}
          </>
        )}
      </Typography>
      <Box mt={1}>
        <RichTextRenderer
          key={site.description}
          html={site.description || ""}
        />
      </Box>
      <MembersGroup items={site.characters || []} />
    </Box>
  )
}
