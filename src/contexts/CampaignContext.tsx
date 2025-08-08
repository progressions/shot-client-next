"use client"
import {
  useMemo,
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react"
import { Subscription } from "@rails/actioncable"
import type { CampaignCableData, Campaign } from "@/types"
import { defaultCampaign } from "@/types"
import { useClient, useLocalStorage } from "@/contexts"

export interface CampaignContextType {
  campaign: Campaign | null
  setCurrentCampaign: (camp: Campaign | null) => Promise<Campaign | null>
  getCurrentCampaign: () => Promise<Campaign | null>
  subscription: Subscription | null
  campaignData: CampaignCableData | null
}

interface CampaignProviderProperties {
  children: React.ReactNode
}

const defaultContext: CampaignContextType = {
  campaign: null,
  setCurrentCampaign: async (camp: Campaign | null) => camp || defaultCampaign,
  getCurrentCampaign: async () => defaultCampaign,
  subscription: null,
  campaignData: null,
}

const CampaignContext = createContext<CampaignContextType>(defaultContext)

export function CampaignProvider({ children }: CampaignProviderProperties) {
  const { user, client } = useClient()
  const { saveLocally, getLocally } = useLocalStorage()
  const consumer = useMemo(() => client.consumer(), [client])
  const [campaign, setCampaign] = useState<Campaign | null>(defaultCampaign)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [campaignData, setCampaignData] = useState<CampaignCableData | null>(
    null
  )

  const setCurrentCampaign = useCallback(
    async (camp: Campaign | null): Promise<Campaign | null> => {
      try {
        const response = await client.setCurrentCampaign(camp)
        const { data } = response || {}
        if (!data) {
          console.error("Failed to set current campaign")
          return null
        }
        setCampaign(data)
        saveLocally(`currentCampaign-${user?.id}`, data)
        return data
      } catch (error) {
        console.error(error)
        return null
      }
    },
    [client, user?.id, saveLocally]
  )

  const getCurrentCampaign = useCallback(async (): Promise<Campaign | null> => {
    try {
      const cachedCampaign = getLocally(`currentCampaign-${user?.id}`)
      if (cachedCampaign) {
        setCampaign(cachedCampaign)
        return cachedCampaign
      }
      const response = await client.getCurrentCampaign()
      const { data } = response || {}
      if (!data) {
        console.error("Failed to get current campaign")
        return null
      }
      setCampaign(data)
      return data
    } catch (error) {
      console.error(error)
      return null
    }
  }, [client, user?.id, getLocally])

  useEffect(() => {
    if (!user?.id) return
    getCurrentCampaign()
  }, [user?.id, getCurrentCampaign])

  useEffect(() => {
    if (!user?.id || !campaign?.id) return
    console.log("about to subscribe to CampaignChannel", campaign.id)
    const sub = consumer.subscriptions.create(
      { channel: "CampaignChannel", id: campaign.id },
      {
        connected: () => console.log("Connected to CampaignChannel"),
        disconnected: () => console.log("Disconnected from CampaignChannel"),
        received: (data: CampaignCableData) => {
          console.log("CampaignChannel data", {
            encounterId: data?.encounter?.id,
            shotCount: data?.encounter?.shots?.length,
            updatedAt: data?.encounter?.updated_at,
          })
          if (data) {
            setCampaignData(data)
          } else {
            console.log("Skipped redundant CampaignChannel data")
          }
        },
      }
    )
    setSubscription(sub)
    return () => {
      sub.unsubscribe()
    }
  }, [user?.id, campaign?.id, consumer, campaignData])

  const contextValue = useMemo(
    () => ({
      campaign,
      setCurrentCampaign,
      getCurrentCampaign,
      subscription,
      campaignData,
    }),
    [
      campaign,
      setCurrentCampaign,
      getCurrentCampaign,
      subscription,
      campaignData,
    ]
  )

  return (
    <CampaignContext.Provider value={contextValue}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  const context = useContext(CampaignContext)
  if (!context) {
    throw new Error("useCampaign must be used within a CampaignProvider")
  }
  return context
}
