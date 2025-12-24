/**
 * AppContext Types
 *
 * Type definitions for the application context including authentication,
 * campaign management, and real-time subscriptions.
 *
 * @module contexts/AppContext/types
 */

import type { ActionDispatch } from "react"
import type { Client } from "@/lib"
import type { User, Campaign, CampaignCableData } from "@/types"
import type { UserStateAction, UserStateType } from "@/reducers"
import type { Subscription } from "@rails/actioncable"

/**
 * Callback function for entity update subscriptions.
 * Called when an entity is updated via WebSocket.
 */
export type EntityUpdateCallback = (data: unknown) => void

/**
 * Main application context type providing global state and services.
 * Includes authentication, campaign management, and real-time subscriptions.
 */
export interface AppContextType {
  /** API client instance for making backend requests */
  client: Client
  /** Current JWT token for authentication */
  jwt: string
  /** Current authenticated user */
  user: User
  /** Currently active campaign (null if none selected) */
  campaign: Campaign | null
  /** WebSocket subscription for real-time campaign updates */
  subscription: Subscription | null
  /** Latest data received from campaign WebSocket channel */
  campaignData: CampaignCableData | null
  /** User reducer state for advanced state management */
  currentUserState: UserStateType
  /** Dispatch function for user state updates */
  dispatchCurrentUser: ActionDispatch<[action: UserStateAction]>
  /** Switch to a different campaign, persists to localStorage */
  setCurrentCampaign: (camp: Campaign | null) => Promise<Campaign | null>
  /** Update campaign state without API call (for local updates) */
  updateCampaign: (updates: Partial<Campaign>) => void
  /** Subscribe to real-time updates for an entity type */
  subscribeToEntity: (
    entityType: string,
    callback: EntityUpdateCallback
  ) => () => void
  /** Re-fetch current user data from backend */
  refreshUser: () => Promise<void>
  /** True while initial user data is loading */
  loading: boolean
  /** Error message if user loading failed */
  error: string | null
  /** True if user has an active campaign */
  hasCampaign: boolean
}

/**
 * Props for the AppProvider component.
 */
export interface AppProviderProps {
  children: React.ReactNode
  initialUser?: User | null
}
