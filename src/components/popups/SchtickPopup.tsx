import { Box, Typography, Stack } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import type { PopupProps, Schtick } from "@/types"
import { defaultSchtick } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { useClient } from "@/contexts"

export default function SchtickPopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [schtick, setSchtick] = useState<Schtick>(defaultSchtick)

  useEffect(() => {
    const fetchSchtick = async () => {
      try {
        const response = await client.getSchtick({ id })
        const fetchedSchtick = response.data
        console.log("Fetched schtick:", fetchedSchtick)
        if (fetchedSchtick) {
          setSchtick(fetchedSchtick)
        } else {
          console.error(`Schtick with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching schtick:", error)
      }
    }

    if (user?.id && id) {
      fetchSchtick().catch(error => {
        console.error("Failed to fetch schtick:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null
  }

  const subhead = [schtick.category, schtick.path].filter(Boolean).join(" - ")

  if (!schtick?.id) {
    return (
      <Box className={styles.mentionPopup}>
        <Typography variant="body2">Loading...</Typography>
      </Box>
    )
  }
  return (
    <Box className={styles.mentionPopup}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Typography>{schtick.name}</Typography>
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        {subhead}
      </Typography>
      <Box mt={1}>
        <RichTextRenderer
          key={schtick.description}
          html={schtick.description || ""}
        />
      </Box>
    </Box>
  )
}
