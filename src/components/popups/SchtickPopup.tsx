import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, Schtick } from "@/types"
import { defaultSchtick } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { useClient } from "@/contexts"
import SchtickLink from "../ui/links/SchtickLink"

export default function SchtickPopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [schtick, setSchtick] = useState<Schtick>(defaultSchtick)

  useEffect(() => {
    const fetchSchtick = async () => {
      try {
        const response = await client.getSchtick({ id })
        const fetchedSchtick = response.data
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
          <SchtickLink schtick={schtick} disablePopup={true} />
        </Typography>
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
