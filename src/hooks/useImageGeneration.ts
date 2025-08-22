"use client"
import { useState, useEffect } from "react"
import type { Entity, CableData } from "@/types"
import { Subscription } from "@rails/actioncable"
import { FormActions, type FormStateAction } from "@/reducers"
import { useClient } from "@/contexts"
import { handleError } from "@/lib"

interface UseImageGenerationProps {
  campaignId: string | number
  entity: Entity
  dispatchForm: (action: FormStateAction<{ image_urls: string[] }>) => void
}

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
        subscription.unsubscribe()
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
                sub.unsubscribe()
              } catch (parseError) {
                console.error("Failed to parse image URLs JSON:", parseError)
                handleError(new Error("Invalid JSON response from server"), dispatchForm)
                setPending(false)
                sub.unsubscribe()
              }
            } else if (data.status === "error" && data.error) {
              console.error("WebSocket error:", data.error)
              handleError(new Error(data.error), dispatchForm)
              setPending(false)
              sub.unsubscribe()
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
