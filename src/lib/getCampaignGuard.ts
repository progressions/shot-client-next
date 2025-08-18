"use server"

import { redirect } from "next/navigation"
import { getServerClient } from "@/lib"

export async function requireCampaign(): Promise<void> {
  const client = await getServerClient()
  
  if (!client) {
    redirect("/login")
  }

  try {
    const response = await client.getCurrentCampaign()
    const campaign = response?.data
    
    // If no campaign or campaign has empty id, redirect to campaigns
    if (!campaign || !campaign.id || campaign.id.trim() === "") {
      redirect("/campaigns")
    }
  } catch (error) {
    // If there's an error getting campaign data, redirect to campaigns
    console.error("Error getting current campaign:", error)
    redirect("/campaigns")
  }
}