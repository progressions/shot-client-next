import { Box, Typography, Stack } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import type { PopupProps, Fight } from "@/types"
import { defaultFight } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import FightAvatar from "@/components/avatars/FightAvatar"
import { useClient } from "@/contexts"
import { FightLink } from "@/components/ui"

export default function FightPopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [fight, setFight] = useState<Fight>(defaultFight)

  useEffect(() => {
    const fetchFight = async () => {
      try {
        const response = await client.getFight({ id })
        const fetchedFight = response.data
        console.log("Fetched fight:", fetchedFight)
        if (fetchedFight) {
          setFight(fetchedFight)
        } else {
          console.error(`Fight with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching fight:", error)
      }
    }

    if (user?.id && id) {
      fetchFight().catch(error => {
        console.error("Failed to fetch fight:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null
  }

  const subhead = ["Feng Shui Fight"].filter(Boolean).join(" - ")

  if (!fight?.id) {
    return (
      <Box className={styles.mentionPopup}>
        <Typography variant="body2">Loading...</Typography>
      </Box>
    )
  }
  return (
    <Box className={styles.mentionPopup}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <FightAvatar fight={fight} disablePopup={true} />
        <Typography>
          <FightLink fight={fight} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ textTransform: "uppercase" }}>
        {subhead}
      </Typography>
      <Box mt={1}>
        <RichTextRenderer
          key={fight.description}
          html={fight.description || ""}
        />
      </Box>
    </Box>
  )
}
