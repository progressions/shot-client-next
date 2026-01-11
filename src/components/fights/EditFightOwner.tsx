"use client"

import type { Fight } from "@/types"
import { UserAutocomplete } from "@/components/autocomplete"
import { useState, useEffect } from "react"
import { useClient, useCampaign } from "@/contexts"

type EditFightOwnerProps = {
  fight: Fight
  updateFight: (fight: Fight) => void
}

export default function EditFightOwner({
  fight,
  updateFight,
}: EditFightOwnerProps) {
  // Use user.id if user object is loaded, otherwise fall back to user_id
  const [ownerId, setOwnerId] = useState(fight.user?.id || fight.user_id || "")
  const { user } = useClient()
  const { campaign } = useCampaign()

  // Sync local state when fight prop changes
  useEffect(() => {
    setOwnerId(fight.user?.id || fight.user_id || "")
  }, [fight.user?.id, fight.user_id])

  // Check if current user can edit ownership
  const canEditOwner = () => {
    if (!user || !campaign) return false

    // Admin can edit any fight
    if (user.admin) return true

    // Gamemaster can edit fights in their campaign
    if (
      campaign.gamemaster?.id === user.id ||
      campaign.gamemaster_id === user.id
    )
      return true

    return false
  }

  const handleOwnerChange = async (newUserId: string | null) => {
    const updatedFight = {
      ...fight,
      user_id: newUserId || null,
    }
    setOwnerId(newUserId || "")
    updateFight(updatedFight)
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
      allowNone={true}
    />
  )
}
