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
