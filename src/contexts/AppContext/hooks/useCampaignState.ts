/**
 * useCampaignState Hook
 *
 * Internal hook for managing campaign selection and persistence.
 *
 * @module contexts/AppContext/hooks/useCampaignState
 */

import { useState, useCallback } from "react"
import Cookies from "js-cookie"
import type { Client } from "@/lib"
import { defaultCampaign, type Campaign } from "@/types"
import { getCampaignStorageKey } from "../utils"

interface UseCampaignStateResult {
  campaign: Campaign | null
  setCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>
  setCurrentCampaign: (camp: Campaign | null) => Promise<Campaign | null>
  updateCampaign: (updates: Partial<Campaign>) => void
}

interface UseCampaignStateProps {
  userId: string
  client: Client
}

/**
 * Internal hook for campaign state management.
 *
 * Handles:
 * - Campaign state
 * - Setting current campaign via API
 * - LocalStorage persistence
 * - Local campaign updates
 *
 * @param props - Configuration including userId and client
 * @returns Campaign state and management functions
 */
export function useCampaignState({
  userId,
  client,
}: UseCampaignStateProps): UseCampaignStateResult {
  const [campaign, setCampaign] = useState<Campaign | null>(defaultCampaign)

  const setCurrentCampaign = useCallback(
    async (camp: Campaign | null): Promise<Campaign | null> => {
      try {
        const response = await client.setCurrentCampaign(camp)
        const { data } = response || {}

        // Handle clearing current campaign (data will be null)
        if (camp === null) {
          setCampaign(null)
          localStorage.removeItem(getCampaignStorageKey(userId))
          return null
        }

        if (!data) {
          console.error("Failed to set current campaign")
          return null
        }
        setCampaign(data)
        localStorage.setItem(getCampaignStorageKey(userId), JSON.stringify(data))
        return data
      } catch (error) {
        // Only clear JWT token if it's an authentication error
        if (
          (error as { response?: { status?: number } })?.response?.status ===
          401
        ) {
          console.error(
            "🔥 REMOVING JWT TOKEN - Authentication error during campaign set"
          )
          Cookies.remove("jwtToken")
        }
        console.error(
          "Failed to set current campaign:",
          (error as Error).message
        )
        return null
      }
    },
    [client, userId]
  )

  // Update campaign state in the global context after successful API save.
  // Used to sync global UI state with form state changes.
  // Also persists to localStorage for consistency across navigation.
  const updateCampaign = useCallback(
    (updates: Partial<Campaign>) => {
      setCampaign(prev => {
        if (!prev) return prev
        const updated = { ...prev, ...updates }
        // Persist to localStorage so navigation doesn't reset the value
        if (userId) {
          localStorage.setItem(
            getCampaignStorageKey(userId),
            JSON.stringify(updated)
          )
        }
        return updated
      })
    },
    [userId]
  )

  return {
    campaign,
    setCampaign,
    setCurrentCampaign,
    updateCampaign,
  }
}
