import { CircularProgress, Box, Typography, Stack } from "@mui/material"
import type { PopupProps, Adventure } from "@/types"
import { defaultAdventure } from "@/types"
import { useState, useEffect } from "react"
import { RichTextRenderer } from "@/components/editor"
import { EntityAvatar } from "@/components/avatars"
import { useClient } from "@/contexts"
import { MembersGroup } from "../ui/MembersGroup"
import AdventureLink from "../ui/links/AdventureLink"

export default function AdventurePopup({ id }: PopupProps) {
  const { user, client } = useClient()
  const [adventure, setAdventure] = useState<Adventure>(defaultAdventure)

  useEffect(() => {
    const fetchAdventure = async () => {
      try {
        const response = await client.getAdventure(id)
        const fetchedAdventure = response.data
        if (fetchedAdventure) {
          setAdventure(fetchedAdventure)
        } else {
          console.error(`Adventure with ID ${id} not found`)
        }
      } catch (error) {
        console.error("Error fetching adventure:", error)
      }
    }

    if (user?.id && id) {
      fetchAdventure().catch(error => {
        console.error("Failed to fetch adventure:", error)
      })
    }
  }, [user, id, client])

  if (!user?.id) {
    return null
  }

  if (!adventure?.id) {
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
        <EntityAvatar entity={adventure} disablePopup={true} />
        <Typography>
          <AdventureLink adventure={adventure} disablePopup={true} />
        </Typography>
      </Stack>
      {adventure.season && (
        <Typography
          component="div"
          variant="caption"
          sx={{ textTransform: "uppercase" }}
        >
          Season {adventure.season}
        </Typography>
      )}
      <Typography>
        {adventure.characters && adventure.characters.length > 0 && (
          <>
            {adventure.characters.length} hero
            {adventure.characters.length !== 1 ? "es" : ""}
          </>
        )}
        {adventure.villains && adventure.villains.length > 0 && (
          <>
            {adventure.characters && adventure.characters.length > 0 && ", "}
            {adventure.villains.length} villain
            {adventure.villains.length !== 1 ? "s" : ""}
          </>
        )}
      </Typography>
      <Box mt={1}>
        <RichTextRenderer
          key={adventure.rich_description || adventure.description}
          html={adventure.rich_description || adventure.description || ""}
        />
      </Box>
      <MembersGroup items={adventure.characters || []} />
    </Box>
  )
}
