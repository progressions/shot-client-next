import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, Faction } from "@/types"
import { defaultFaction } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { EntityAvatar } from "@/components/avatars"
import { useClient } from "@/contexts"
import { MembersGroup } from "../ui/MembersGroup"
import FactionLink from "../ui/links/FactionLink"

export default function FactionPopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [faction, setFaction] = useState<Faction>(defaultFaction)

  useEffect(() => {
    const fetchFaction = async () => {
      try {
        const response = await client.getFaction({ id })
        const fetchedFaction = response.data
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

  if (!faction?.id) {
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
        <EntityAvatar entity={faction} disablePopup={true} />
        <Typography>
          <FactionLink faction={faction} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography>
        {faction.characters && faction.characters.length > 0 && (
          <>
            {faction.characters.length} member
            {faction.characters.length !== 1 ? "s" : ""}
          </>
        )}
      </Typography>
      <Box mt={1}>
        <RichTextRenderer
          key={faction.description}
          html={faction.description || ""}
        />
      </Box>
      <MembersGroup items={faction.characters || []} />
    </Box>
  )
}
