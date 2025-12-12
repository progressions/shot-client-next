"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { useApp } from "@/contexts"
import { OnboardingModule } from "./OnboardingModule"

export const OnboardingClientWrapper: React.FC = () => {
  const { user, loading } = useApp()
  const pathname = usePathname()

  // Hide onboarding module on Player View - keep that view focused on gameplay
  const isPlayerView = /^\/encounters\/\d+\/play\/\d+$/.test(pathname)

  if (loading || !user || !user.onboarding_progress || isPlayerView) {
    return null
  }

  return <OnboardingModule user={user} />
}
