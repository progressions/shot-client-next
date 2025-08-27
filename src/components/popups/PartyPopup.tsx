import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, Party } from "@/types"
import { defaultParty } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { EntityAvatar } from "@/components/avatars"
import { useClient } from "@/contexts"
import { MembersGroup, FactionLink, PartyLink } from "@/components/ui"

export default function PartyPopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [party, setParty] = useState<Party>(defaultParty)

  useEffect(() => {
    const fetchParty = async () => {
      try {
        const response = await client.getParty({ id })
        const fetchedParty = response.data
        if (fetchedParty) {
          setParty(fetchedParty)
        } else {
          console.error(`Party with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching party:", error)
      }
    }

    if (user?.id && id) {
      fetchParty().catch(error => {
        console.error("Failed to fetch party:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null // Use null instead of <></> for consistency
  }

  if (!party?.id) {
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
        <EntityAvatar entity={party} disablePopup={true} />
        <Typography>
          <PartyLink party={party} disablePopup={true} />
        </Typography>
      </Stack>
      <Typography
        component="div"
        variant="caption"
        sx={{ textTransform: "uppercase" }}
      >
        {party.faction && (
          <>
            <FactionLink faction={party.faction} />
          </>
        )}
      </Typography>
      <Typography>
        {party.characters && party.characters.length > 0 && (
          <>
            {party.characters.length} member
            {party.characters.length !== 1 ? "s" : ""}
          </>
        )}
      </Typography>
      <Box mt={1}>
        <RichTextRenderer
          key={party.description}
          html={party.description || ""}
        />
      </Box>
      <MembersGroup items={party.characters || []} />
    </Box>
  )
}
