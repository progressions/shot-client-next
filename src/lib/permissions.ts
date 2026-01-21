import type { User, Campaign } from "@/types"

/**
 * Check if a user is a player (not GM or admin) for a campaign.
 * Players have restricted access to certain features like Adventures.
 *
 * Permission logic:
 * - Admins always have full access
 * - Campaign owner (gamemaster_id) has full access
 * - Everyone else is a player with restricted access
 *
 * Note: This uses campaign-specific permissions rather than the global
 * user.gamemaster flag, since a user may be a GM in one campaign but
 * a player in another.
 *
 * @param user - The user to check
 * @param campaign - The campaign context (optional, but needed for accurate check)
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

  // If we have campaign context, check if user is the campaign's gamemaster
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
