"use client"

import { useApp } from "@/contexts"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface CampaignGuardProps {
  children: React.ReactNode
}

export function CampaignGuard({ children }: CampaignGuardProps) {
  const { hasCampaign, loading, user } = useApp()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while still loading campaign data
    if (loading) return

    // If no campaign is active, check if user is still in onboarding
    if (!hasCampaign) {
      const onboardingProgress = user?.onboarding_progress
      
      // Allow homepage access if user hasn't created their first campaign yet
      if (onboardingProgress && !onboardingProgress.first_campaign_created_at) {
        return // Don't redirect - allow onboarding users to stay on homepage
      }
      
      // User has completed campaign creation but has no campaign - redirect
      router.push("/campaigns")
    }
  }, [hasCampaign, loading, router, user])

  // Show loading state while determining campaign status
  if (loading) {
    return <div>Loading...</div>
  }

  // Don't render children if no campaign AND user has completed campaign creation
  if (!hasCampaign) {
    const onboardingProgress = user?.onboarding_progress
    
    // Allow rendering for onboarding users who haven't created a campaign yet
    if (onboardingProgress && !onboardingProgress.first_campaign_created_at) {
      return <>{children}</>
    }
    
    // Block rendering for users who should be redirected
    return null
  }

  return <>{children}</>
}
