"use client"

/**
 * AppContext - Global Application State Management
 *
 * Provides centralized state management for the entire application including:
 * - User authentication and JWT token management
 * - Current campaign selection and persistence
 * - Real-time WebSocket subscriptions via Phoenix Channels
 * - API client access
 *
 * Exports three specialized hooks for different use cases:
 * - `useApp()` - Full context access (user, campaign, client, loading state)
 * - `useClient()` - API client and authentication state
 * - `useCampaign()` - Campaign state and WebSocket subscriptions
 *
 * @module contexts/AppContext
 */

import { createContext, useContext, useState, useMemo } from "react"
import { Client } from "@/lib"
import { defaultUser, defaultCampaign, type Campaign } from "@/types"
import { initialUserState } from "@/reducers"
import type { AppContextType, AppProviderProps } from "./types"
import { useCampaignState } from "./hooks/useCampaignState"
import { useWebSocketSubscriptions } from "./hooks/useWebSocketSubscriptions"
import { useAuthState } from "./hooks/useAuthState"

const AppContext = createContext<AppContextType>({
  client: Client(),
  jwt: "",
  user: defaultUser,
  campaign: null,
  subscription: null,
  campaignData: null,
  currentUserState: initialUserState,
  dispatchCurrentUser: () => {},
  setCurrentCampaign: async (camp: Campaign | null) => camp || defaultCampaign,
  updateCampaign: () => {},
  subscribeToEntity: () => () => {},
  refreshUser: async () => {},
  loading: true,
  error: null,
  hasCampaign: false,
})

/**
 * Application context provider.
 *
 * Composes authentication, campaign, and WebSocket state management
 * into a single context provider.
 *
 * @param children - Child components
 * @param initialUser - Optional initial user for SSR
 */
export function AppProvider({ children, initialUser }: AppProviderProps) {
  // Campaign state - managed at top level for cross-hook access
  const [campaign, setCampaign] = useState<Campaign | null>(defaultCampaign)

  // Authentication state and initial data fetch
  const auth = useAuthState({
    initialUser,
    setCampaign,
  })

  // Campaign management (setCurrentCampaign, updateCampaign)
  const campaignState = useCampaignState({
    userId: auth.user.id,
    client: auth.client,
  })

  // Sync campaign state from campaignState hook
  // Note: We use local campaign state for useAuthState initial load,
  // but campaignState.campaign for the provider value
  const effectiveCampaign = campaign

  // WebSocket subscriptions
  const ws = useWebSocketSubscriptions({
    userId: auth.user.id,
    campaignId: effectiveCampaign?.id,
    client: auth.client,
    setCampaign,
  })

  const hasCampaign = Boolean(
    effectiveCampaign?.id && effectiveCampaign.id.trim() !== ""
  )

  // Compose setCurrentCampaign to also update local state
  const setCurrentCampaign = useMemo(
    () => async (camp: Campaign | null) => {
      const result = await campaignState.setCurrentCampaign(camp)
      if (result) {
        setCampaign(result)
      } else if (camp === null) {
        setCampaign(null)
      }
      return result
    },
    [campaignState]
  )

  // Compose updateCampaign to also update local state
  const updateCampaign = useMemo(
    () => (updates: Partial<Campaign>) => {
      campaignState.updateCampaign(updates)
      setCampaign(prev => (prev ? { ...prev, ...updates } : prev))
    },
    [campaignState]
  )

  return (
    <AppContext.Provider
      value={{
        // Auth domain
        client: auth.client,
        jwt: auth.jwt || "",
        user: auth.user,
        loading: auth.loading,
        error: auth.error,
        currentUserState: auth.state,
        dispatchCurrentUser: auth.dispatch,
        refreshUser: auth.refreshUser,

        // Campaign domain
        campaign: effectiveCampaign,
        setCurrentCampaign,
        updateCampaign,
        hasCampaign,

        // WebSocket domain
        subscription: ws.subscription,
        campaignData: ws.campaignData,
        subscribeToEntity: ws.subscribeToEntity,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

/**
 * Hook to access the full application context.
 * Provides user, campaign, client, and all app-level state.
 *
 * @returns Full AppContextType with all properties
 *
 * @example
 * ```tsx
 * const { user, campaign, refreshUser, hasCampaign } = useApp()
 * ```
 */
export function useApp(): AppContextType {
  return useContext(AppContext)
}

/**
 * Hook to access the API client and authentication state.
 * Use when you need to make API calls or check user authentication.
 *
 * @returns Object with client, jwt, user, and user state management
 *
 * @example
 * ```tsx
 * const { client, user } = useClient()
 * const characters = await client.getCharacters()
 * ```
 */
export function useClient() {
  const { client, jwt, user, currentUserState, dispatchCurrentUser } =
    useContext(AppContext)
  return { client, jwt, user, currentUserState, dispatchCurrentUser }
}

/**
 * Hook to access campaign state and real-time subscriptions.
 * Use for campaign-scoped operations and WebSocket updates.
 *
 * @returns Object with campaign, subscription, campaignData, and management functions
 *
 * @example
 * ```tsx
 * const { campaign, setCurrentCampaign, campaignData } = useCampaign()
 *
 * // Switch campaigns
 * await setCurrentCampaign(newCampaign)
 *
 * // Access real-time updates
 * if (campaignData?.character) {
 *   // Handle character update from WebSocket
 * }
 * ```
 */
export function useCampaign() {
  const {
    campaign,
    subscription,
    campaignData,
    setCurrentCampaign,
    updateCampaign,
    subscribeToEntity,
  } = useContext(AppContext)
  return {
    campaign,
    subscription,
    campaignData,
    setCurrentCampaign,
    updateCampaign,
    subscribeToEntity,
  }
}
