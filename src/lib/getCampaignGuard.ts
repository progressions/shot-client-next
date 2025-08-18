"use server"

import { redirect } from "next/navigation"
import { getServerClient } from "@/lib"

export async function requireCampaign(): Promise<void> {
  console.log("🔒 requireCampaign - starting campaign check")
  
  const client = await getServerClient()
  
  if (!client) {
    console.log("🔒 requireCampaign - no client, redirecting to login")
    redirect("/login")
  }

  console.log("🔒 requireCampaign - client available, checking current campaign")

  try {
    const response = await client.getCurrentCampaign()
    const campaign = response?.data
    
    console.log("🔒 requireCampaign - campaign response:", campaign ? `Campaign ${campaign.id}` : "No campaign")
    
    // If no campaign or campaign has empty id, redirect to campaigns
    if (!campaign || !campaign.id || campaign.id.trim() === "") {
      console.log("🔒 requireCampaign - no campaign found, redirecting to /campaigns")
      redirect("/campaigns")
    }
    
    console.log("🔒 requireCampaign - campaign found, access granted")
  } catch (error: any) {
    console.log("🔒 requireCampaign - error occurred:", {
      status: error?.response?.status,
      code: error?.code,
      message: error?.message
    })
    
    // If it's an authentication error (401), redirect to login
    if (error?.response?.status === 401) {
      console.log("🔒 requireCampaign - 401 error, redirecting to login")
      redirect("/login")
    }
    // Otherwise, redirect to campaigns (user is authenticated but no campaign)
    console.log("🔒 requireCampaign - non-401 error, user authenticated but no campaign, redirecting to /campaigns")
    redirect("/campaigns")
  }
}