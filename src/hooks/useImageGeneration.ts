"use client"

/**
 * useImageGeneration Hook
 *
 * Handles AI image generation for entities (characters, etc.) using WebSocket
 * for real-time progress updates. Triggers the generation API and listens
 * for completion via Phoenix Channels.
 *
 * @module hooks/useImageGeneration
 */

import { useState, useEffect } from "react"
import type { Entity, CableData } from "@/types"
import { Subscription } from "@rails/actioncable"
import { FormActions, type FormStateAction } from "@/reducers"
import { useClient } from "@/contexts"
import { handleError } from "@/lib"

/**
 * Props for the useImageGeneration hook.
 *
 * @property campaignId - Campaign ID for WebSocket channel subscription
 * @property entity - The entity to generate images for
 * @property dispatchForm - Form dispatch to update image_urls state
 */
interface UseImageGenerationProps {
  campaignId: string | number
  entity: Entity
  dispatchForm: (action: FormStateAction<{ image_urls: string[] }>) => void
}

/**
 * Hook for generating AI images for an entity via WebSocket.
 * Triggers image generation and listens for results on the campaign channel.
 *
 * @param props - Configuration object
 * @param props.campaignId - Campaign ID for WebSocket subscription
 * @param props.entity - Entity to generate images for (character, etc.)
 * @param props.dispatchForm - Form dispatch to update image_urls state
 *
 * @returns Object with:
 * - `pending` - True while waiting for image generation
 * - `generateImages()` - Trigger image generation
 *
 * @example
 * ```tsx
 * const { pending, generateImages } = useImageGeneration({
 *   campaignId: campaign.id,
 *   entity: character,
 *   dispatchForm,
 * })
 *
 * <Button onClick={generateImages} disabled={pending}>
 *   {pending ? "Generating..." : "Generate Images"}
 * </Button>
 * ```
 */
export function useImageGeneration({
  campaignId,
  entity,
  dispatchForm,
}: UseImageGenerationProps) {
  const { client } = useClient()
  const [pending, setPending] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.disconnect()
      }
    }
  }, [subscription])

  async function generateImages() {
    dispatchForm({ type: FormActions.UPDATE, name: "image_urls", value: [] })
    dispatchForm({ type: FormActions.SUBMIT })
    setPending(true)
    try {
      await client.generateAiImages({ entity })
      const sub = client.consumer().subscriptions.create(
        { channel: "CampaignChannel", id: campaignId },
        {
          received: (data: CableData) => {
            if (data.status === "preview_ready" && data.json) {
              try {
                const imageUrls: string[] = JSON.parse(data.json)
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "image_urls",
                  value: imageUrls,
                })
                dispatchForm({
                  type: FormActions.SUCCESS,
                  payload: "Images generated successfully",
                })
                setPending(false)
                sub.disconnect()
              } catch (parseError) {
                console.error("Failed to parse image URLs JSON:", parseError)
                handleError(
                  new Error("Invalid JSON response from server"),
                  dispatchForm
                )
                setPending(false)
                sub.disconnect()
              }
            } else if (data.status === "error" && data.error) {
              console.error("WebSocket error:", data.error)
              handleError(new Error(data.error), dispatchForm)
              setPending(false)
              sub.disconnect()
            }
          },
        }
      )
      setSubscription(sub)
    } catch (err) {
      handleError(err, dispatchForm)
      setPending(false)
    }
  }

  return { pending, generateImages }
}
