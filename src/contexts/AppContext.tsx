"use client"
import {
  type ActionDispatch,
  useCallback,
  useReducer,
  useEffect,
  useMemo,
  createContext,
  useContext,
  useState,
  useRef,
} from "react"
import Cookies from "js-cookie"
import { Client } from "@/lib"
import {
  defaultUser,
  type User,
  type Campaign,
  CampaignCableData,
} from "@/types"
import { defaultCampaign } from "@/types"
import {
  UserStateAction,
  UserActions,
  userReducer,
  initialUserState,
} from "@/reducers"
import { Subscription } from "@rails/actioncable"

type EntityUpdateCallback = (data: unknown) => void

/**
 * Handles authentication conflict resolution when localStorage and backend users don't match
 * Clears all frontend authentication data, calls backend logout, and redirects to login
 */
function handleAuthConflictResolution(
  jwt: string | null,
  client: Client
): void {
  console.log("🔄 Resolving authentication conflict...")

  // 1. Clear all localStorage authentication data
  if (typeof window !== "undefined") {
    // Clear all auth-related localStorage items
    // We need to iterate through all possible keys since Object.keys doesn't work reliably in tests
    const keysToCheck = []

    // Build list of keys to check
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) keysToCheck.push(key)
    }

    // Also check known key patterns directly
    if (jwt) {
      keysToCheck.push(`currentUser-${jwt}`)
    }

    // Filter and remove matching keys
    const keysToRemove = keysToCheck.filter(
      key =>
        key.startsWith("currentUser-") ||
        key.startsWith("currentCampaign-") ||
        key.includes("jwt") ||
        key.includes("token")
    )

    console.log(`  Clearing ${keysToRemove.length} localStorage keys`)
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    // Clear sessionStorage as well
    sessionStorage.clear()
  }

  // 2. Clear cookies
  Cookies.remove("jwtToken")
  Cookies.remove("userId")

  // 3. Attempt stateless backend logout (fire and forget)
  if (jwt) {
    // Fire the logout request but don't wait for it
    client.logout().catch(() => {
      // Silently ignore logout errors during conflict resolution
      console.log("  Backend logout request failed (continuing anyway)")
    })
  }

  // 4. Redirect to login page
  console.log("  Redirecting to /login...")
  window.location.href = "/login"
}

interface AppContextType {
  client: Client
  jwt: string
  user: User
  campaign: Campaign | null
  subscription: Subscription | null
  campaignData: CampaignCableData | null
  currentUserState: UserStateType
  dispatchCurrentUser: ActionDispatch<[action: UserStateAction]>
  setCurrentCampaign: (camp: Campaign | null) => Promise<Campaign | null>
  subscribeToEntity: (
    entityType: string,
    callback: EntityUpdateCallback
  ) => () => void
  refreshUser: () => Promise<void>
  loading: boolean
  error: string | null
  hasCampaign: boolean
}

interface AppProviderProperties {
  children: React.ReactNode
  initialUser?: User | null
}

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
  subscribeToEntity: () => () => {},
  loading: true,
  error: null,
  hasCampaign: false,
})

export function AppProvider({ children, initialUser }: AppProviderProperties) {
  const [state, dispatch] = useReducer(userReducer, {
    ...initialUserState,
    user: initialUser || defaultUser,
  })
  const [campaign, setCampaign] = useState<Campaign | null>(defaultCampaign)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [campaignData, setCampaignData] = useState<CampaignCableData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const jwt =
    (typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null) ||
    Cookies.get("jwtToken") ||
    null
  const client = useMemo(() => Client({ jwt: jwt || undefined }), [jwt])
  const hasFetched = useRef(false)
  const entityUpdateCallbacks = useRef<Map<string, Set<EntityUpdateCallback>>>(
    new Map()
  )

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

  const setCurrentCampaign = useCallback(
    async (camp: Campaign | null): Promise<Campaign | null> => {
      try {
        const response = await client.setCurrentCampaign(camp)
        const { data } = response || {}

        // Handle clearing current campaign (data will be null)
        if (camp === null) {
          setCampaign(null)
          localStorage.removeItem(`currentCampaign-${state.user.id}`)
          return null
        }

        if (!data) {
          setError("Failed to set current campaign")
          return null
        }
        setCampaign(data)
        localStorage.setItem(
          `currentCampaign-${state.user.id}`,
          JSON.stringify(data)
        )
        return data
      } catch (error) {
        // Only clear JWT token if it's an authentication error
        if (
          (error as { response?: { status?: number } })?.response?.status ===
          401
        ) {
          console.error(
            "🔥 REMOVING JWT TOKEN - Authentication error during campaign set"
          )
          Cookies.remove("jwtToken")
        }
        setError("Failed to set current campaign: " + (error as Error).message)
        return null
      }
    },
    [client, state.user.id]
  )

  useEffect(() => {
    if (!jwt || hasFetched.current) return
    if (state.user.id && campaign && campaign.id !== defaultCampaign.id) {
      setLoading(false)
      return
    }
    hasFetched.current = true

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const cachedUser = localStorage.getItem(`currentUser-${jwt}`)
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser)
          const expectedUserId = Cookies.get("userId")

          // NEW: Validate cached user matches expected user
          if (
            parsedUser &&
            parsedUser.id !== defaultUser.id &&
            parsedUser.id === expectedUserId
          ) {
            dispatch({ type: UserActions.USER, payload: parsedUser })
            const cachedCampaign = localStorage.getItem(
              `currentCampaign-${parsedUser.id}`
            )
            if (cachedCampaign) {
              const parsedCampaign = JSON.parse(cachedCampaign)
              if (parsedCampaign && parsedCampaign.id !== defaultCampaign.id) {
                setCampaign(parsedCampaign)
                setLoading(false)
                return
              }
            }
          } else if (
            parsedUser &&
            expectedUserId &&
            parsedUser.id !== expectedUserId
          ) {
            // Cache mismatch detected - clear and fetch fresh
            console.warn("🔧 Cache mismatch detected, clearing user cache")
            localStorage.removeItem(`currentUser-${jwt}`)
            // Continue to fresh API fetch
          }
        }

        const userResponse = await client.getCurrentUser()
        const { data: userData } = userResponse || {}
        if (!userData) {
          setError("Failed to fetch user data")
          console.error("🔥 REMOVING JWT TOKEN - Failed to fetch user data")
          Cookies.remove("jwtToken")
          setLoading(false)
          return
        }

        // Check for authentication conflict with cached user
        if (cachedUser) {
          const parsedCachedUser = JSON.parse(cachedUser)
          if (parsedCachedUser && parsedCachedUser.id !== userData.id) {
            console.warn(
              "🔥 Auth conflict detected: localStorage user doesn't match backend user"
            )
            console.warn(
              `  localStorage: ${parsedCachedUser.id} (${parsedCachedUser.email})`
            )
            console.warn(`  backend: ${userData.id} (${userData.email})`)

            // Clear all authentication data and redirect
            handleAuthConflictResolution(jwt, client)
            return
          }
        }

        dispatch({ type: UserActions.USER, payload: userData })
        localStorage.setItem(`currentUser-${jwt}`, JSON.stringify(userData))

        const cachedCampaign = localStorage.getItem(
          `currentCampaign-${userData.id}`
        )
        if (cachedCampaign) {
          const parsedCampaign = JSON.parse(cachedCampaign)
          if (parsedCampaign && parsedCampaign.id !== defaultCampaign.id) {
            setCampaign(parsedCampaign)
            setLoading(false)
            return
          }
        }

        const campaignResponse = await client.getCurrentCampaign()
        const { data: campaignData } = campaignResponse || {}
        if (!campaignData) {
          setError("No campaign data available")
          setCampaign(defaultCampaign)
        } else {
          setCampaign(campaignData)
          localStorage.setItem(
            `currentCampaign-${userData.id}`,
            JSON.stringify(campaignData)
          )
        }
      } catch (error) {
        const statusCode = (error as { response?: { status?: number } })
          ?.response?.status

        // Only clear JWT token for authentication errors (401)
        if (statusCode === 401) {
          console.error("🔥 REMOVING JWT TOKEN - Authentication error:", error)
          Cookies.remove("jwtToken")
          setError("Authentication expired")
        } else if (statusCode === 404) {
          // 404 on current campaign just means no current campaign set - this is normal
          setCampaign(defaultCampaign)
        } else {
          // Other errors - don't clear JWT but log them
          console.error(
            "⚠️ Error fetching campaign (keeping authentication):",
            error
          )
          setError("Failed to fetch campaign data")
          setCampaign(defaultCampaign)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jwt, client, state.user.id, campaign])

  useEffect(() => {
    if (!state.user.id || !campaign?.id || campaign.id === defaultCampaign.id)
      return

    const sub = client.consumer().subscriptions.create(
      { channel: "CampaignChannel", id: campaign.id },
      {
        connected: () => {}, // Connected to CampaignChannel
        disconnected: () => {}, // Disconnected from CampaignChannel
        received: (data: CampaignCableData) => {
          if (data) {
            setCampaignData(data)
          }
        },
      }
    )
    setSubscription(sub)
    return () => {
      sub.unsubscribe()
    }
  }, [state.user.id, campaign?.id, client])

  // Subscribe to user-specific channel for campaign list updates
  useEffect(() => {
    if (!state.user.id) return

    const userSub = client.consumer().subscriptions.create(
      { channel: "UserChannel", id: state.user.id },
      {
        connected: () => {}, // Connected to UserChannel
        disconnected: () => {}, // Disconnected from UserChannel
        received: (data: CampaignCableData) => {
          if (data) {
            setCampaignData(data)
          }
        },
      }
    )

    return () => {
      userSub.unsubscribe()
    }
  }, [state.user.id, client])

  // Process campaignData and trigger callbacks
  useEffect(() => {
    if (!campaignData) return

    console.log("🔄 AppContext: Processing campaignData:", campaignData)
    Object.entries(campaignData).forEach(([key, value]) => {
      const callbacks = entityUpdateCallbacks.current.get(key)
      console.log(
        `🔄 AppContext: Entity '${key}' - value: ${value}, callbacks: ${callbacks?.size || 0}`
      )
      if (callbacks && callbacks.size > 0) {
        callbacks.forEach(callback => {
          try {
            console.log(
              `🔄 AppContext: Calling callback for '${key}' with value:`,
              value
            )
            callback(value)
          } catch (error) {
            console.error(`Error in ${key} callback:`, error)
          }
        })
      }
    })
  }, [campaignData])

  const refreshUser = useCallback(async () => {
    if (!jwt) {
      console.log("⚠️ No JWT token available for user refresh")
      return
    }

    try {
      console.log("🔄 Refreshing user data for onboarding progress...")
      const userResponse = await client.getCurrentUser()
      const { data: userData } = userResponse || {}

      if (userData) {
        console.log("✅ User data refreshed successfully")
        console.log("📊 Onboarding progress:", userData.onboarding_progress)
        dispatch({ type: UserActions.USER, payload: userData })
        localStorage.setItem(`currentUser-${jwt}`, JSON.stringify(userData))
      } else {
        console.log("⚠️ No user data returned from API")
      }
    } catch (error) {
      console.error("⚠️ Failed to refresh user data:", error)
    }
  }, [jwt, client, dispatch])

  const hasCampaign = Boolean(campaign?.id && campaign.id.trim() !== "")

  return (
    <AppContext.Provider
      value={{
        client,
        jwt,
        user: state.user,
        campaign,
        subscription,
        campaignData,
        currentUserState: state,
        dispatchCurrentUser: dispatch,
        setCurrentCampaign,
        subscribeToEntity,
        refreshUser,
        loading,
        error,
        hasCampaign,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  return useContext(AppContext)
}

export function useClient() {
  const { client, jwt, user, currentUserState, dispatchCurrentUser } =
    useContext(AppContext)
  return { client, jwt, user, currentUserState, dispatchCurrentUser }
}

export function useCampaign() {
  const {
    campaign,
    subscription,
    campaignData,
    setCurrentCampaign,
    subscribeToEntity,
  } = useContext(AppContext)
  return {
    campaign,
    subscription,
    campaignData,
    setCurrentCampaign,
    subscribeToEntity,
  }
}
