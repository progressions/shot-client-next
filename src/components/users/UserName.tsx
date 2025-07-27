"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { User } from "@/types/types"

interface UserNameProps {
  user: User
}

export default function UserName({ user }: UserNameProps) {
  const { campaignData } = useCampaign()
  const [displayName, setDisplayName] = useState(user.name || user.email)

  useEffect(() => {
    if (campaignData && "user" in campaignData) {
      const updatedUser = campaignData.user
      if (updatedUser && updatedUser.id === user.id) {
        if (updatedUser.name) {
          setDisplayName(updatedUser.name || updatedUser.email)
        }
      }
    }
  }, [campaignData, user.id])

  return (<>
      {displayName}
    </>)
}

