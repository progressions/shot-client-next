"use client"

import { useState, useEffect } from "react"
import { useCampaign } from "@/contexts"
import type { Juncture } from "@/types"

interface JunctureNameProperties {
  juncture: Juncture
}

export default function JunctureName({ juncture }: JunctureNameProperties) {
  const { subscribeToEntity } = useCampaign()
  const [displayName, setDisplayName] = useState(juncture.name)

  // Subscribe to juncture updates
  useEffect(() => {
    const unsubscribe = subscribeToEntity("juncture", (data) => {
      if (data && data.id === juncture.id && data.name) {
        setDisplayName(data.name)
      }
    })
    return unsubscribe
  }, [subscribeToEntity, juncture.id])

  return <>{displayName}</>
}
