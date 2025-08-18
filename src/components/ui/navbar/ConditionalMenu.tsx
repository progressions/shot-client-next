"use client"

import { useApp } from "@/contexts"
import { MainMenu } from "@/components/ui/navbar/MainMenu"
import { CampaignRequiredMenu } from "@/components/ui/navbar/CampaignRequiredMenu"

export function ConditionalMenu() {
  const { hasCampaign } = useApp()

  return hasCampaign ? <MainMenu /> : <CampaignRequiredMenu />
}
