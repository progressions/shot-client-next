"use client"

import { useApp } from "@/contexts"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface CampaignGuardProps {
  children: React.ReactNode
}

export function CampaignGuard({ children }: CampaignGuardProps) {
  const { hasCampaign, loading } = useApp()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while still loading campaign data
    if (loading) return

    // If no campaign is active, redirect to campaigns page
    if (!hasCampaign) {
      router.push("/campaigns")
    }
  }, [hasCampaign, loading, router])

  // Show loading state while determining campaign status
  if (loading) {
    return <div>Loading...</div>
  }

  // Don't render children if no campaign (will redirect)
  if (!hasCampaign) {
    return null
  }

  return <>{children}</>
}
