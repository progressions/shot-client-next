"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { OnboardingMilestone, isRelevantPage } from "@/lib/onboarding"

/**
 * Props for the useOnboardingHighlight hook.
 *
 * @property currentMilestone - The current onboarding milestone to highlight for
 * @property shouldHighlight - Whether highlighting is enabled (defaults to true)
 */
export interface UseOnboardingHighlightProps {
  currentMilestone: OnboardingMilestone | null
  shouldHighlight?: boolean
}

/**
 * Hook for managing onboarding UI highlight state.
 *
 * Determines whether to show onboarding highlights based on:
 * - Whether the user is on the relevant page for the current milestone
 * - Whether highlighting is enabled
 * - A 500ms delay to ensure target elements are rendered
 *
 * @param props - Configuration with currentMilestone and optional shouldHighlight
 * @returns Object with isHighlighting state, currentMilestone, and dismissHighlight function
 *
 * @example
 * ```tsx
 * const { isHighlighting, currentMilestone, dismissHighlight } = useOnboardingHighlight({
 *   currentMilestone: user?.onboarding_progress?.current_milestone,
 *   shouldHighlight: !hasCompletedOnboarding
 * })
 *
 * {isHighlighting && (
 *   <OnboardingPointer
 *     milestone={currentMilestone}
 *     onDismiss={dismissHighlight}
 *   />
 * )}
 * ```
 */
export function useOnboardingHighlight({
  currentMilestone,
  shouldHighlight = true,
}: UseOnboardingHighlightProps) {
  const pathname = usePathname()
  const [isHighlighting, setIsHighlighting] = useState(false)

  useEffect(() => {
    if (!shouldHighlight || !currentMilestone) {
      setIsHighlighting(false)
      return
    }

    const isOnTargetPage = isRelevantPage(currentMilestone, pathname)

    if (isOnTargetPage) {
      // Small delay to ensure the target element is rendered
      const timeoutId = setTimeout(() => {
        setIsHighlighting(true)
      }, 500)

      return () => clearTimeout(timeoutId)
    } else {
      setIsHighlighting(false)
    }
  }, [currentMilestone, pathname, shouldHighlight])

  const dismissHighlight = () => {
    setIsHighlighting(false)
  }

  return {
    isHighlighting: isHighlighting && !!currentMilestone,
    currentMilestone,
    dismissHighlight,
  }
}
