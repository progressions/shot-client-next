"use client"

import React from "react"
import { useApp } from "@/contexts"
import { OnboardingModule } from "./OnboardingModule"

export const OnboardingClientWrapper: React.FC = () => {
  const { user, loading } = useApp()

  if (loading || !user || !user.onboarding_progress) {
    return null
  }

  return <OnboardingModule user={user} />
}
