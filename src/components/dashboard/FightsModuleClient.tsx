"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useCampaign } from "@/contexts"

interface FightsModuleClientProps {
  children: React.ReactNode
}

export default function FightsModuleClient({
  children,
}: FightsModuleClientProps) {
  const router = useRouter()
  const { subscribeToEntity } = useCampaign()
  const isRefreshing = useRef(false)

  const handleReload = useCallback(() => {
    if (isRefreshing.current) return
    isRefreshing.current = true
    router.refresh()
    // Reset after a short delay to allow subsequent refreshes
    setTimeout(() => {
      isRefreshing.current = false
    }, 1000)
  }, [router])

  useEffect(() => {
    const unsubscribe = subscribeToEntity("fights", data => {
      if (data === "reload") {
        handleReload()
      }
    })
    return unsubscribe
  }, [subscribeToEntity, handleReload])

  return <>{children}</>
}
