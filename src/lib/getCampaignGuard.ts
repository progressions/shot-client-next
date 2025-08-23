"use server"

import { redirect } from "next/navigation"
import { getServerClient } from "@/lib"

export async function requireCampaign(): Promise<void> {
  const client = await getServerClient()

  if (!client) {
    redirect("/login")
  }

  try {
    // Check if user has a current campaign
    const campaignResponse = await client.getCurrentCampaign()
    const campaign = campaignResponse?.data

    // If user has a campaign, they're good to go
    if (campaign && campaign.id && campaign.id.trim() !== "") {
      return
    }

    // No campaign - check if user is still in onboarding
    const userResponse = await client.getCurrentUser()
    const user = userResponse?.data
    const onboardingProgress = user?.onboarding_progress

    // If user hasn't created their first campaign yet, allow them to stay on homepage
    if (onboardingProgress && !onboardingProgress.first_campaign_created_at) {
      return // Allow access to homepage for users who haven't created a campaign yet
    }

    // User has completed onboarding but has no campaign - redirect to campaigns
    redirect("/campaigns")
  } catch (error: unknown) {
    // If it's an authentication error (401), redirect to login
    if (
      (error as { response?: { status?: number } })?.response?.status === 401
    ) {
      redirect("/login")
    }
    // Otherwise, redirect to campaigns (user is authenticated but no campaign)
    redirect("/campaigns")
  }
}
