"use client"

import type { Character } from "@/types"
import { UserAutocomplete } from "@/components/autocomplete"
import { useState, useEffect } from "react"
import { useClient, useCampaign } from "@/contexts"

type EditOwnerProps = {
  character: Character
  updateCharacter: (character: Character) => void
}

export default function EditOwner({
  character,
  updateCharacter,
}: EditOwnerProps) {
  const [ownerId, setOwnerId] = useState(character.user?.id || "")
  const { user } = useClient()
  const { campaign } = useCampaign()

  // Sync local state when character prop changes
  useEffect(() => {
    setOwnerId(character.user?.id || "")
  }, [character])

  // Check if current user can edit ownership
  const canEditOwner = () => {
    if (!user || !campaign) return false

    // Admin can edit any character
    if (user.admin) return true

    // Gamemaster can edit characters in their campaign
    if (campaign.gamemaster?.id === user.id) return true

    return false
  }

  const handleOwnerChange = async (newUserId: string | null) => {
    if (!newUserId) return

    const updatedCharacter = {
      ...character,
      user_id: newUserId,
    }
    setOwnerId(newUserId)
    updateCharacter(updatedCharacter)
  }

  // Don't show if user can't edit
  if (!canEditOwner()) {
    return null
  }

  return (
    <UserAutocomplete
      value={ownerId}
      onChange={handleOwnerChange}
      filters={{ campaign_id: campaign?.id }}
      allowNone={false}
    />
  )
}
