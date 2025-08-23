'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { OnboardingMilestone, isRelevantPage } from '@/lib/onboarding'

export interface UseOnboardingHighlightProps {
  currentMilestone: OnboardingMilestone | null
  shouldHighlight?: boolean
}

export function useOnboardingHighlight({ 
  currentMilestone, 
  shouldHighlight = true 
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
    dismissHighlight
  }
}