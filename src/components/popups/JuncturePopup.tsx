import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import styles from "@/components/editor/Editor.module.scss"
import type { PopupProps, Juncture } from "@/types"
import { defaultJuncture } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { useClient } from "@/contexts"
import {
  MembersGroup,
  InfoLink,
  FactionLink,
  JunctureLink,
} from "@/components/ui"

export default function JuncturePopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [juncture, setJuncture] = useState<Juncture>(defaultJuncture)

  useEffect(() => {
    const fetchJuncture = async () => {
      try {
        const response = await client.getJuncture({ id })
        const fetchedJuncture = response.data
        console.log("Fetched juncture:", fetchedJuncture)
        if (fetchedJuncture) {
          setJuncture(fetchedJuncture)
        } else {
          console.error(`Juncture with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching juncture:", error)
      }
    }

    if (user?.id && id) {
      fetchJuncture().catch(error => {
        console.error("Failed to fetch juncture:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null // Use null instead of <></> for consistency
  }

  const subhead = ["Juncture", juncture.faction?.name]
    .filter(Boolean)
    .join(" - ")

  if (!juncture?.id) {
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
        <Typography>
          <JunctureLink juncture={juncture} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography
        component="div"
        variant="caption"
        className={styles.popupSubhead}
        sx={{ textTransform: "uppercase" }}
      >
        <InfoLink href="/junctures" info="Juncture" />{" "}
        {juncture.faction && (
          <>
            {" - "}
            <FactionLink faction={juncture.faction} />
          </>
        )}
      </Typography>
      <RichTextRenderer
        key={juncture.description}
        html={juncture.description || ""}
      />
      <MembersGroup items={juncture.members || []} />
    </Box>
  )
}
