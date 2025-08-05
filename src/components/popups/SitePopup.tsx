import { Box, Typography, Stack } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import type { PopupProps, Site } from "@/types"
import { defaultSite } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { SiteAvatar } from "@/components/avatars"
import { useClient } from "@/contexts"
import { SiteLink } from "@/components/ui"

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

  const subhead = ["Feng Shui Site", site.faction?.name]
    .filter(Boolean)
    .join(" - ")

  if (!site?.id) {
    return (
      <Box className={styles.mentionPopup}>
        <Typography variant="body2">Loading...</Typography>
      </Box>
    )
  }
  return (
    <Box className={styles.mentionPopup}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <SiteAvatar site={site} disablePopup={true} />
        <Typography>
          <SiteLink site={site} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        {subhead}
      </Typography>
      <Box mt={1}>
        <RichTextRenderer
          key={site.description}
          html={site.description || ""}
        />
      </Box>
    </Box>
  )
}
