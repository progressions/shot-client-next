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
 * Handles authentication conflict resolution when localStorage and backend users don&apos;t match
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
    // Fire the logout request but don&apos;t wait for it
    client.logout().catch(() => {
      // Silently ignore logout errors during conflict resolution
      console.log("  Backend logout request failed (continuing anyway)")
    })
  }

  // 4. Redirect to login page
  console.log("  Redirecting to /login...")
  window.location.href = "/login"
}

function normalizeStoredCampaign(storedValue: unknown): Campaign | null {
  if (!storedValue || typeof storedValue !== "object") {
    return null
  }

  if ("campaign" in storedValue) {
    const { campaign } = storedValue as { campaign?: Campaign | null }
    return campaign ?? null
  }

  return storedValue as Campaign
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
        // Only clear JWT token if it&apos;s an authentication error
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
              const normalizedCampaign = normalizeStoredCampaign(parsedCampaign)
              if (
                normalizedCampaign &&
                normalizedCampaign.id &&
                normalizedCampaign.id !== defaultCampaign.id
              ) {
                setCampaign(normalizedCampaign)
                localStorage.setItem(
                  `currentCampaign-${parsedUser.id}`,
                  JSON.stringify(normalizedCampaign)
                )
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
          const normalizedCampaign = normalizeStoredCampaign(parsedCampaign)
          if (
            normalizedCampaign &&
            normalizedCampaign.id &&
            normalizedCampaign.id !== defaultCampaign.id
          ) {
            setCampaign(normalizedCampaign)
            localStorage.setItem(
              `currentCampaign-${userData.id}`,
              JSON.stringify(normalizedCampaign)
            )
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
          // Other errors - don&apos;t clear JWT but log them
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
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "unknown"
    console.log(
      "🔌 [AppContext] WebSocket subscription check on page:",
      currentPath,
      {
        userId: state.user.id,
        campaignId: campaign?.id,
        isDefaultCampaign: campaign?.id === defaultCampaign.id,
        shouldSubscribe: !!(
          state.user.id &&
          campaign?.id &&
          campaign.id !== defaultCampaign.id
        ),
      }
    )

    if (!state.user.id || !campaign?.id || campaign.id === defaultCampaign.id) {
      console.log(
        "❌ [AppContext] Not subscribing to WebSocket - missing requirements on page:",
        currentPath
      )
      return
    }

    console.log(
      "✅ [AppContext] Creating WebSocket subscription to campaign:",
      campaign.id
    )
    console.log(
      "✅ [AppContext] Subscription identifier will be:",
      JSON.stringify({ channel: "CampaignChannel", id: campaign.id })
    )

    // Track connection state and setup reconnection logic
    let isConnected = false
    let connectionCheckInterval: NodeJS.Timeout | null = null
    let lastDataReceived = Date.now()

    console.log(
      "🔧 [AppContext] Creating WebSocket subscription on page:",
      currentPath,
      "campaign:",
      campaign.id
    )

    const subscriptionId = `${campaign.id}-${currentPath.replace(/\//g, "-")}`
    console.log("🔧 [AppContext] Subscription ID:", subscriptionId)

    const sub = client.consumer().subscriptions.create(
      {
        channel: "CampaignChannel",
        id: campaign.id,
        client_id: subscriptionId,
      },
      {
        connected: function () {
          console.log(
            "🔗 [AppContext] WebSocket CONNECTED to CampaignChannel on page:",
            currentPath,
            "campaign:",
            campaign.id
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
          isConnected = true
          lastDataReceived = Date.now()
        },
        disconnected: function () {
          console.log(
            "❌ [AppContext] WebSocket DISCONNECTED from CampaignChannel:",
            campaign.id
          )
          isConnected = false
          if (connectionCheckInterval) {
            clearInterval(connectionCheckInterval)
            connectionCheckInterval = null
          }
        },
        received: function (data: CampaignCableData) {
          console.log(
            "🚀 [AppContext] RECEIVED FUNCTION CALLED on page:",
            window.location.pathname
          )

          const timestamp = Date.now()
          lastDataReceived = timestamp
          isConnected = true // Mark connection as active when receiving data

          console.log(
            "📡 [AppContext] WebSocket data received on CampaignChannel:",
            data,
            "at",
            new Date(timestamp).toLocaleTimeString(),
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
              console.log(`🔧 [AppContext] ${key} update received:`, data[key])
            }
          })

          if (data) {
            console.log(
              "🔄 [AppContext] Processing WebSocket data for campaignData state"
            )
            console.log(
              "🔄 [AppContext] Previous campaignData keys:",
              Object.keys(campaignData || {})
            )

            // Process all data, including both entity objects and reload signals
            Object.keys(data).forEach(key => {
              const value = data[key]
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
      if (connectionCheckInterval) clearInterval(connectionCheckInterval)
      sub.disconnect()
    }
  }, [state.user.id, campaign?.id])

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
            // Merge new data with existing to prevent overwrites
            setCampaignData(prev => ({ ...prev, ...data }))
          }
        },
      }
    )

    return () => {
      userSub.disconnect()
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
