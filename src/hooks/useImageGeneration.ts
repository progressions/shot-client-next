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
        console.log("WebSocket subscription cleaned up")
      }
    }
  }, [subscription])

  async function generateImages() {
    console.log(
      "Generate button clicked for entity:",
      entity.name,
      "campaign ID:",
      campaignId
    )
    dispatchForm({ type: FormActions.UPDATE, name: "image_urls", value: [] })
    dispatchForm({ type: FormActions.SUBMIT })
    setPending(true)
    try {
      console.log("Sending POST request to generateAiImages")
      await client.generateAiImages({ entity })
      console.log("POST request successful, setting up WebSocket subscription")
      const sub = client.consumer().subscriptions.create(
        { channel: "CampaignChannel", id: campaignId },
        {
          received: (data: CableData) => {
            console.log("WebSocket data received:", data)
            if (data.status === "preview_ready" && data.json) {
              const imageUrls: string[] = JSON.parse(data.json)
              console.log("Parsed image URLs:", imageUrls)
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
              console.log("WebSocket subscription unsubscribed")
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
      console.log("WebSocket subscription created")
    } catch (err) {
      handleError(err, dispatchForm)
      setPending(false)
    }
  }

  return { pending, generateImages }
}
