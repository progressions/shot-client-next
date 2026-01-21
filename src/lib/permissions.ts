import type { User, Campaign } from "@/types"

/**
 * Check if a user is a player (not GM or admin) for a campaign.
 * Players have restricted access to certain features like Adventures.
 *
 * @param user - The user to check
 * @param campaign - The campaign context (optional)
 * @returns true if the user is a player (not GM or admin), false otherwise
 */
export function isPlayerForCampaign(
  user: User | null | undefined,
  campaign?: Campaign | null
): boolean {
  // If no user, treat as restricted (player)
  if (!user) return true

  // Admins always have full access
  if (user.admin) return false

  // GMs have full access
  if (user.gamemaster) return false

  // If we have campaign context and user is the gamemaster, they have full access
  if (campaign && campaign.gamemaster_id === user.id) return false

  // Otherwise, user is a player with restricted access
  return true
}

/**
 * Check if a user has GM-level access to a campaign.
 * This is the inverse of isPlayerForCampaign.
 *
 * @param user - The user to check
 * @param campaign - The campaign context (optional)
 * @returns true if the user has GM/admin access, false otherwise
 */
export function hasGmAccess(
  user: User | null | undefined,
  campaign?: Campaign | null
): boolean {
  return !isPlayerForCampaign(user, campaign)
}
