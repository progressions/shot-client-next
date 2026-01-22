/**
 * useWebSocketSubscriptions Hook
 *
 * Internal hook for managing WebSocket subscriptions to Phoenix Channels.
 *
 * @module contexts/AppContext/hooks/useWebSocketSubscriptions
 */

import { useState, useCallback, useEffect, useRef } from "react"
import type { Client } from "@/lib"
import { defaultCampaign, type Campaign, type CampaignCableData } from "@/types"
import type { Subscription } from "@rails/actioncable"
import {
  isValidNotificationData,
  type EntityUpdateCallback,
  type NotificationCallback,
} from "../types"

interface UseWebSocketSubscriptionsResult {
  subscription: Subscription | null
  campaignData: CampaignCableData | null
  subscribeToEntity: (
    entityType: string,
    callback: EntityUpdateCallback
  ) => () => void
  subscribeToNotifications: (callback: NotificationCallback) => () => void
}

interface UseWebSocketSubscriptionsProps {
  userId: string
  campaignId: string | undefined
  client: Client
  setCampaign: React.Dispatch<React.SetStateAction<Campaign | null>>
  /** When true, WebSocket subscription is deferred until loading completes.
   * This prevents subscribing with stale cached campaign data before the API
   * confirms the actual current campaign. */
  loading?: boolean
}

/**
 * Internal hook for WebSocket subscription management.
 *
 * Handles:
 * - CampaignChannel subscription for real-time campaign updates
 * - UserChannel subscription for campaign list updates
 * - Entity update callback registry
 * - Campaign data processing and distribution
 *
 * @param props - Configuration including userId, campaignId, client, and campaign setter
 * @returns WebSocket state and subscription function
 */
export function useWebSocketSubscriptions({
  userId,
  campaignId,
  client,
  setCampaign,
  loading = false,
}: UseWebSocketSubscriptionsProps): UseWebSocketSubscriptionsResult {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [campaignData, setCampaignData] = useState<CampaignCableData | null>(
    null
  )
  const entityUpdateCallbacks = useRef<Map<string, Set<EntityUpdateCallback>>>(
    new Map()
  )
  const notificationCallbacks = useRef<Set<NotificationCallback>>(new Set())

  const subscribeToEntity = useCallback(
    (entityType: string, callback: EntityUpdateCallback) => {
      if (!entityUpdateCallbacks.current.has(entityType)) {
        entityUpdateCallbacks.current.set(entityType, new Set())
      }
      entityUpdateCallbacks.current.get(entityType)!.add(callback)

      return () => {
        entityUpdateCallbacks.current.get(entityType)?.delete(callback)
        if (entityUpdateCallbacks.current.get(entityType)?.size === 0) {
          entityUpdateCallbacks.current.delete(entityType)
        }
      }
    },
    []
  )

  const subscribeToNotifications = useCallback(
    (callback: NotificationCallback) => {
      notificationCallbacks.current.add(callback)
      return () => {
        notificationCallbacks.current.delete(callback)
      }
    },
    []
  )

  // CampaignChannel subscription
  useEffect(() => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "unknown"
    console.log(
      "🔌 [AppContext] WebSocket subscription check on page:",
      currentPath,
      {
        userId,
        campaignId,
        loading,
        isDefaultCampaign: campaignId === defaultCampaign.id,
        shouldSubscribe: !!(
          userId &&
          campaignId &&
          campaignId !== defaultCampaign.id &&
          !loading
        ),
      }
    )

    // Don't subscribe while loading - this prevents using stale cached campaign
    // data before the API confirms the actual current campaign
    if (loading) {
      console.log(
        "⏳ [AppContext] Deferring WebSocket subscription - still loading campaign data"
      )
      return
    }

    if (!userId || !campaignId || campaignId === defaultCampaign.id) {
      console.log(
        "❌ [AppContext] Not subscribing to WebSocket - missing requirements on page:",
        currentPath
      )
      return
    }

    console.log(
      "✅ [AppContext] Creating WebSocket subscription to campaign:",
      campaignId
    )
    console.log(
      "✅ [AppContext] Subscription identifier will be:",
      JSON.stringify({ channel: "CampaignChannel", id: campaignId })
    )

    console.log(
      "🔧 [AppContext] Creating WebSocket subscription on page:",
      currentPath,
      "campaign:",
      campaignId
    )

    const subscriptionId = `${campaignId}-${currentPath.replace(/\//g, "-")}`
    console.log("🔧 [AppContext] Subscription ID:", subscriptionId)

    const sub = client.consumer().subscriptions.create(
      {
        channel: "CampaignChannel",
        id: campaignId,
        client_id: subscriptionId,
      },
      {
        connected: function () {
          console.log(
            "🔗 [AppContext] WebSocket CONNECTED to CampaignChannel on page:",
            currentPath,
            "campaign:",
            campaignId
          )
          console.log(
            "🔗 [AppContext] Subscription created:",
            !!sub,
            "with callbacks:",
            {
              connected: typeof this.connected,
              disconnected: typeof this.disconnected,
              received: typeof this.received,
            }
          )
          console.log("🔧 [AppContext] Sub object:", sub)
        },
        disconnected: function () {
          console.log(
            "❌ [AppContext] WebSocket DISCONNECTED from CampaignChannel:",
            campaignId
          )
        },
        received: function (data: CampaignCableData) {
          console.log(
            "🚀 [AppContext] RECEIVED FUNCTION CALLED on page:",
            window.location.pathname
          )

          console.log(
            "📡 [AppContext] WebSocket data received on CampaignChannel:",
            data,
            "at",
            new Date().toLocaleTimeString(),
            "on page:",
            window.location.pathname
          )

          // Log all possible entity types
          if (data && data.fight) {
            console.log("🥊 [AppContext] Fight update received:", {
              id: data.fight?.id,
              name: data.fight?.name,
              active: data.fight?.active,
            })
          }
          if (data && data.fights === "reload") {
            console.log(
              "🔄 [AppContext] Fights reload signal received - should trigger list refresh"
            )
          }
          if (data && data.encounter) {
            console.log("⚔️ [AppContext] Encounter update received:", {
              id: data.encounter?.id,
              firstShot: data.encounter?.shots?.[0],
              actionId: data.encounter?.action_id,
            })
          }
          if (data && data.character) {
            console.log("👤 [AppContext] Character update received:", {
              id: data.character?.id,
              name: data.character?.name,
            })
          }
          if (data && data.characters === "reload") {
            console.log(
              "🔄 [AppContext] Characters reload signal received - should trigger list refresh"
            )
          }

          // Log any other entity types
          Object.keys(data || {}).forEach(key => {
            if (
              ![
                "fight",
                "fights",
                "encounter",
                "character",
                "characters",
              ].includes(key)
            ) {
              console.log(
                `🔧 [AppContext] ${key} update received:`,
                data[key as keyof CampaignCableData]
              )
            }
          })

          if (data) {
            console.log(
              "🔄 [AppContext] Processing WebSocket data for campaignData state"
            )

            // Process all data, including both entity objects and reload signals
            Object.keys(data).forEach(key => {
              const value = data[key as keyof CampaignCableData]
              if (typeof value === "object" && value !== null) {
                console.log(
                  `🔄 [AppContext] Including ${key} entity update in campaignData`
                )
              } else {
                console.log(
                  `🔄 [AppContext] Including ${key}="${value}" reload signal in campaignData`
                )
              }
            })

            // Update campaignData with all data (entities and reload signals)
            setCampaignData(prev => {
              const newData = { ...prev, ...data }
              console.log(
                "🔄 [AppContext] New campaignData keys:",
                Object.keys(newData)
              )
              return newData
            })
          }
        },
      }
    )
    setSubscription(sub)
    return () => {
      sub.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- campaignData and client intentionally omitted to prevent reconnection loops
  }, [userId, campaignId, loading])

  // UserChannel subscription for campaign list updates and notifications
  useEffect(() => {
    if (!userId) return

    const userSub = client.consumer().subscriptions.create(
      { channel: "UserChannel", id: userId },
      {
        connected: () => {
          console.debug("🔔 [UserChannel] Connected for notifications")
        },
        disconnected: () => {
          console.debug("🔔 [UserChannel] Disconnected")
        },
        received: (data: unknown) => {
          // Check if this is a notification event with proper validation
          const typedData = data as
            | { notification?: unknown }
            | CampaignCableData
          if (
            typedData &&
            "notification" in typedData &&
            typedData.notification &&
            isValidNotificationData(typedData.notification)
          ) {
            console.debug(
              "🔔 [UserChannel] Notification received:",
              typedData.notification
            )
            const notification = typedData.notification
            notificationCallbacks.current.forEach(callback => {
              try {
                callback(notification)
              } catch (error) {
                console.error("Error in notification callback:", error)
              }
            })
          } else if (data) {
            // Merge campaign data with existing to prevent overwrites
            setCampaignData(prev => ({
              ...prev,
              ...(data as CampaignCableData),
            }))
          }
        },
      }
    )

    return () => {
      userSub.unsubscribe()
    }
  }, [userId, client])

  // Process campaignData and trigger callbacks
  useEffect(() => {
    if (!campaignData) return

    console.log("🔄 AppContext: Processing campaignData:", campaignData)

    // Handle partial campaign updates from WebSocket (e.g., grok_credits_exhausted_at)
    if (
      campaignData.campaign &&
      typeof campaignData.campaign === "object" &&
      "id" in campaignData.campaign
    ) {
      const incomingCampaign = campaignData.campaign as Campaign
      console.log(
        "🔄 AppContext: Merging partial campaign update:",
        incomingCampaign
      )
      setCampaign(prev => {
        if (!prev) return prev
        if (incomingCampaign.id === prev.id) {
          return { ...prev, ...incomingCampaign }
        }
        return prev
      })
    }

    Object.entries(campaignData).forEach(([key, value]) => {
      console.debug("[WebSocket] Dispatching campaignData entry", key, value)
      const callbacks = entityUpdateCallbacks.current.get(key)
      console.debug(
        `🔄 AppContext: Entity '${key}' - value: ${value}, callbacks: ${callbacks?.size || 0}`
      )

      // Trigger callbacks for both entity objects and reload signals
      // Reload signals are strings like "reload", entity updates are objects
      if (callbacks && callbacks.size > 0) {
        callbacks.forEach(callback => {
          try {
            callback(value)
          } catch (error) {
            console.error(`Error in ${key} callback:`, error)
          }
        })
      }
    })

    // Clear processed data after a short delay to prevent memory buildup
    // but long enough to ensure all components have processed it
    const timer = setTimeout(() => {
      setCampaignData(null)
    }, 1000)

    return () => clearTimeout(timer)
  }, [campaignData, setCampaign])

  return {
    subscription,
    campaignData,
    subscribeToEntity,
    subscribeToNotifications,
  }
}
