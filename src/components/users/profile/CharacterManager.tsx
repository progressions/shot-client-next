"use client"

import { Box, Skeleton, Stack } from "@mui/material"
import { Manager, Icon, InfoLink } from "@/components/ui"
import { useClient, useToast, useCampaign } from "@/contexts"
import type { User, Entity } from "@/types"

interface CharacterManagerProps {
  user: User
  onUserUpdate: (user: User) => void
}

export default function CharacterManager({
  user,
  onUserUpdate,
}: CharacterManagerProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { campaign } = useCampaign()

  if (!campaign) {
    return null
  }

  // If characters aren't loaded yet, show skeleton
  if (!user.characters) {
    return (
      <Box sx={{ my: 4 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width="100%" height={40} />
        </Stack>
      </Box>
    )
  }

  // Handle updates from ListManager - receives updated entity with new character_ids
  const handleListUpdate = async (updatedEntity: Entity) => {
    const updatedUser = updatedEntity as User
    const newCharacterIds = updatedUser.character_ids || []
    const oldCharacterIds = user.character_ids || []

    // Find added character
    const addedId = newCharacterIds.find(id => !oldCharacterIds.includes(id))
    // Find removed character
    const removedId = oldCharacterIds.find(id => !newCharacterIds.includes(id))

    try {
      if (addedId) {
        // Add character to user by setting character's user_id
        const formData = new FormData()
        formData.append("character", JSON.stringify({ user_id: user.id }))
        await client.updateCharacter(addedId, formData)
        toastSuccess("Character added successfully")
      }

      if (removedId) {
        // Remove character from user by clearing character's user_id
        const formData = new FormData()
        formData.append("character", JSON.stringify({ user_id: null }))
        await client.updateCharacter(removedId, formData)
        toastSuccess("Character removed successfully")
      }

      // Update local state with the new user data
      onUserUpdate(updatedUser)
    } catch (error) {
      console.error("Failed to update character:", error)
      toastError("Failed to update character")
    }
  }

  return (
    <Manager
      icon={<Icon keyword="Character" />}
      title="My Characters"
      parentEntity={user}
      childEntityName="Character"
      description={
        <>
          <InfoLink href="/characters" info="Characters" /> you own in the
          current campaign.
        </>
      }
      onListUpdate={handleListUpdate}
      excludeIds={user.character_ids || []}
    />
  )
}
