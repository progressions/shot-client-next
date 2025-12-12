"use client"

/**
 * useCharacterExtension Hook
 *
 * Handles AI character extension using WebSocket for real-time progress updates.
 * Triggers the extension API and listens for completion via Phoenix Channels.
 *
 * @module hooks/useCharacterExtension
 */

import { useState, useEffect, useCallback } from "react"
import type { Character, CableData } from "@/types"
import { Subscription } from "@rails/actioncable"
import { useClient, useToast } from "@/contexts"

/**
 * Props for the useCharacterExtension hook.
 *
 * @property campaignId - Campaign ID for WebSocket channel subscription
 * @property character - The character to extend
 * @property onComplete - Optional callback when extension completes with updated character
 */
interface UseCharacterExtensionProps {
  campaignId: string | number
  character: Character
  onComplete?: (character: Character) => void
}

/**
 * Hook for extending a character with AI-generated details via WebSocket.
 * Triggers character extension and listens for results on the campaign channel.
 *
 * @param props - Configuration object
 * @param props.campaignId - Campaign ID for WebSocket subscription
 * @param props.character - Character to extend
 * @param props.onComplete - Optional callback when extension completes
 *
 * @returns Object with:
 * - `pending` - True while waiting for extension to complete
 * - `extendCharacter()` - Trigger character extension
 * - `isExtending` - True if character has extending=true (from database)
 *
 * @example
 * ```tsx
 * const { pending, extendCharacter, isExtending } = useCharacterExtension({
 *   campaignId: campaign.id,
 *   character,
 *   onComplete: (updatedChar) => setCharacter(updatedChar),
 * })
 *
 * <Button onClick={extendCharacter} disabled={pending || isExtending}>
 *   {pending || isExtending ? "Extending..." : "Extend Character"}
 * </Button>
 * ```
 */
export function useCharacterExtension({
  campaignId,
  character,
  onComplete,
}: UseCharacterExtensionProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [pending, setPending] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  // Check if the character is currently being extended (from database field)
  const isExtending = character.extending ?? false

  // Clean up subscription on unmount
  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.disconnect()
      }
    }
  }, [subscription])

  const extendCharacter = useCallback(async () => {
    // Don't allow extension if already in progress
    if (isExtending || pending) {
      return
    }

    setPending(true)
    try {
      await client.extendCharacter(character)

      // Subscribe to WebSocket for status updates
      const sub = client.consumer().subscriptions.create(
        { channel: "CampaignChannel", id: campaignId },
        {
          received: (data: CableData) => {
            if (data.status === "character_ready" && data.character) {
              toastSuccess(
                `Character "${data.character.name}" extended successfully`
              )
              setPending(false)
              sub.disconnect()

              // Call the onComplete callback with updated character
              if (onComplete) {
                onComplete(data.character)
              }
            } else if (data.status === "error" && data.error) {
              console.error("Character extension error:", data.error)
              toastError(data.error)
              setPending(false)
              sub.disconnect()
            }
          },
        }
      )
      setSubscription(sub)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to extend character"
      toastError(errorMessage)
      setPending(false)
    }
  }, [
    client,
    campaignId,
    character,
    isExtending,
    pending,
    onComplete,
    toastSuccess,
    toastError,
  ])

  return {
    pending,
    extendCharacter,
    isExtending,
  }
}
