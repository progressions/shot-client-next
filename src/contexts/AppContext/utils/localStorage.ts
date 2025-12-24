/**
 * LocalStorage Utilities
 *
 * Helper functions for managing cached campaign and user data in localStorage.
 *
 * @module contexts/AppContext/utils/localStorage
 */

import type { Campaign } from "@/types"

/**
 * Normalizes stored campaign data that may be in different formats.
 * Handles both direct campaign objects and wrapped `{ campaign: ... }` objects.
 *
 * @param storedValue - Value retrieved from localStorage
 * @returns Normalized Campaign object or null
 */
export function normalizeStoredCampaign(storedValue: unknown): Campaign | null {
  if (!storedValue || typeof storedValue !== "object") {
    return null
  }

  if ("campaign" in storedValue) {
    const { campaign } = storedValue as { campaign?: Campaign | null }
    return campaign ?? null
  }

  return storedValue as Campaign
}

/**
 * Gets the localStorage key for storing a user's data.
 *
 * @param jwt - JWT token identifying the user session
 * @returns Storage key for the user
 */
export function getUserStorageKey(jwt: string): string {
  return `currentUser-${jwt}`
}

/**
 * Gets the localStorage key for storing a user's current campaign.
 *
 * @param userId - User ID
 * @returns Storage key for the campaign
 */
export function getCampaignStorageKey(userId: string): string {
  return `currentCampaign-${userId}`
}
