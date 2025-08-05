import { Box, Typography, Stack } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import type { PopupProps, Faction } from "@/types"
import { defaultFaction } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { FactionAvatar } from "@/components/avatars"
import { useClient } from "@/contexts"
import { FactionLink } from "@/components/ui"

export default function FactionPopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [faction, setFaction] = useState<Faction>(defaultFaction)

  useEffect(() => {
    const fetchFaction = async () => {
      try {
        const response = await client.getFaction({ id })
        const fetchedFaction = response.data
        console.log("Fetched faction:", fetchedFaction)
        if (fetchedFaction) {
          setFaction(fetchedFaction)
        } else {
          console.error(`Faction with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching faction:", error)
      }
    }

    if (user?.id && id) {
      fetchFaction().catch(error => {
        console.error("Failed to fetch faction:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null // Use null instead of <></> for consistency
  }

  const subhead = ["Faction"].filter(Boolean).join(" - ")

  if (!faction?.id) {
    return (
      <Box className={styles.mentionPopup}>
        <Typography variant="body2">Loading...</Typography>
      </Box>
    )
  }
  return (
    <Box className={styles.mentionPopup}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <FactionAvatar faction={faction} disablePopup={true} />
        <Typography>
          <FactionLink faction={faction} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        {subhead}
      </Typography>
      <Box mt={1}>
        <RichTextRenderer
          key={faction.description}
          html={faction.description || ""}
        />
      </Box>
    </Box>
  )
}
