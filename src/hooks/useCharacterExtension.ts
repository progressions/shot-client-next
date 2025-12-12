"use client"

/**
 * useCharacterExtension Hook
 *
 * Handles AI character extension using WebSocket for real-time progress updates.
 * Triggers the extension API and listens for completion via Phoenix Channels.
 *
 * @module hooks/useCharacterExtension
 */

import { useState, useEffect, useCallback, useRef } from "react"
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

  // Use refs to avoid stale closure issues and ensure proper cleanup
  const subscriptionRef = useRef<Subscription | null>(null)
  const handledRef = useRef(false)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Check if the character is currently being extended (from database field)
  const isExtending = character.extending ?? false

  // Clean up subscription on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.disconnect()
        subscriptionRef.current = null
      }
    }
  }, [])

  const extendCharacter = useCallback(async () => {
    // Don't allow extension if already in progress
    if (isExtending || pending) {
      return
    }

    // Reset handled flag for new extension
    handledRef.current = false

    // Disconnect existing subscription if any (prevent memory leak)
    if (subscriptionRef.current) {
      subscriptionRef.current.disconnect()
      subscriptionRef.current = null
    }

    setPending(true)
    try {
      await client.extendCharacter(character)

      // Subscribe to WebSocket for status updates
      const sub = client.consumer().subscriptions.create(
        { channel: "CampaignChannel", id: campaignId },
        {
          received: (data: CableData) => {
            // Prevent handling multiple messages (race condition)
            if (handledRef.current) {
              return
            }

            // Filter messages to only handle this character's extension
            if (
              data.status === "character_ready" &&
              data.character &&
              data.character.id === character.id
            ) {
              handledRef.current = true
              toastSuccess(
                `Character "${data.character.name}" extended successfully`
              )
              setPending(false)
              sub.disconnect()
              subscriptionRef.current = null

              // Call the onComplete callback with updated character
              if (onCompleteRef.current) {
                onCompleteRef.current(data.character)
              }
            } else if (data.status === "error" && data.error) {
              handledRef.current = true
              console.error("Character extension error:", data.error)
              toastError(data.error)
              setPending(false)
              sub.disconnect()
              subscriptionRef.current = null
            }
          },
        }
      )
      subscriptionRef.current = sub
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
    toastSuccess,
    toastError,
  ])

  return {
    pending,
    extendCharacter,
    isExtending,
  }
}
