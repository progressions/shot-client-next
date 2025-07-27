"use client"

import { useMemo, useEffect, useState, createContext, useContext, useCallback } from "react"
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

interface CampaignProviderProps {
  children: React.ReactNode
}

const defaultContext: CampaignContextType = {
  campaign: null,
  setCurrentCampaign: async (camp: Campaign | null) => (camp || defaultCampaign),
  getCurrentCampaign: async () => defaultCampaign,
  subscription: null,
  campaignData: null
}

const CampaignContext = createContext<CampaignContextType>(defaultContext)

export function CampaignProvider({ children }: CampaignProviderProps) {
  const { user, client } = useClient()
  const { saveLocally, getLocally } = useLocalStorage()
  const consumer = useMemo(() => client.consumer(), [client])

  const [campaign, setCampaign] = useState<Campaign | null>(defaultCampaign)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [campaignData, setCampaignData] = useState<CampaignCableData | null>(null)

  const setCurrentCampaign = async (camp: Campaign | null): Promise<Campaign | null> => {
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
    } catch (err) {
      console.error(err)
    }
    return null
  }

  const getCurrentCampaign = useCallback(async (): Promise<Campaign | null> => {
    try {
      const cachedCampaign = getLocally(`currentCampaign-${user?.id}`) as Campaign | null
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
    } catch (err) {
      console.error(err)
    }
    return null
  }, [client, user, setCampaign, getLocally])

  useEffect(() => {
    if (!user?.id) return

    getCurrentCampaign()
  }, [user, getCurrentCampaign])

  useEffect(() => {
    if (!user?.id || !campaign?.id) return

    console.log("about to subscribe to CampaignChannel", campaign.id)
    const sub = consumer.subscriptions.create(
      { channel: "CampaignChannel", id: campaign.id },
      {
        connected: () => console.log("Connected to CampaignChannel"),
        disconnected: () => console.log("Disconnected from CampaignChannel"),
        received: (data: CampaignCableData) => {
          console.log("CampaignChannel data", data)
          setCampaignData(data)
        }
      }
    )

    setSubscription(sub)

    return () => {
      sub.unsubscribe()
    }
  }, [user, campaign, consumer])

  return (
    <CampaignContext.Provider value={{ campaign, setCurrentCampaign, getCurrentCampaign, subscription, campaignData }}>
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  return useContext(CampaignContext)
}
