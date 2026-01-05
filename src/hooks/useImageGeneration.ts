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
 * Provider display names for error messages.
 */
const PROVIDER_NAMES: Record<string, string> = {
  grok: "Grok (xAI)",
  openai: "OpenAI",
  gemini: "Google Gemini",
}

/**
 * Props for the useImageGeneration hook.
 *
 * @property campaignId - Campaign ID for WebSocket channel subscription
 * @property entity - The entity to generate images for
 * @property dispatchForm - Form dispatch to update image_urls state
 * @property onError - Optional callback when an error occurs (for showing toasts)
 * @property providerName - Optional AI provider name for error messages
 */
interface UseImageGenerationProps {
  campaignId: string | number
  entity: Entity
  dispatchForm: (action: FormStateAction<{ image_urls: string[] }>) => void
  onError?: (message: string) => void
  providerName?: string
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
  onError,
  providerName,
}: UseImageGenerationProps) {
  const displayProviderName =
    PROVIDER_NAMES[providerName ?? ""] ?? providerName ?? "AI service"
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
                const errorMessage = "Invalid JSON response from server"
                console.error("Failed to parse image URLs JSON:", parseError)
                handleError(new Error(errorMessage), dispatchForm)
                onError?.(errorMessage)
                setPending(false)
                sub.disconnect()
              }
            } else if (data.status === "credit_exhausted" && data.error) {
              // Handle billing/quota limit errors with a user-friendly message
              const errorMessage = `${displayProviderName} billing limit reached. Please check your API key billing settings or try a different provider.`
              console.error("AI credits exhausted:", data.error)
              handleError(new Error(errorMessage), dispatchForm)
              onError?.(errorMessage)
              setPending(false)
              sub.disconnect()
            } else if (data.status === "error" && data.error) {
              console.error("WebSocket error:", data.error)
              handleError(new Error(data.error), dispatchForm)
              onError?.(data.error)
              setPending(false)
              sub.disconnect()
            }
          },
        }
      )
      setSubscription(sub)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate images"
      handleError(err, dispatchForm)
      onError?.(errorMessage)
      setPending(false)
    }
  }

  return { pending, generateImages }
}
