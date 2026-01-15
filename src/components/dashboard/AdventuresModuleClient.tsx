"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useCampaign } from "@/contexts"

interface AdventuresModuleClientProps {
  children: React.ReactNode
}

export default function AdventuresModuleClient({
  children,
}: AdventuresModuleClientProps) {
  const router = useRouter()
  const { subscribeToEntity } = useCampaign()
  const isRefreshing = useRef(false)

  const handleReload = useCallback(() => {
    if (isRefreshing.current) return
    isRefreshing.current = true
    router.refresh()
    setTimeout(() => {
      isRefreshing.current = false
    }, 1000)
  }, [router])

  useEffect(() => {
    const unsubscribe = subscribeToEntity("adventures", data => {
      if (data === "reload") {
        handleReload()
      }
    })
    return unsubscribe
  }, [subscribeToEntity, handleReload])

  return <>{children}</>
}
