/**
 * useAuthState Hook
 *
 * Internal hook for managing authentication state including JWT tokens,
 * user data fetching, and auth conflict detection.
 *
 * @module contexts/AppContext/hooks/useAuthState
 */

import {
  useReducer,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from "react"
import Cookies from "js-cookie"
import { Client } from "@/lib"
import { defaultUser, defaultCampaign, type User, type Campaign } from "@/types"
import { UserActions, userReducer, initialUserState } from "@/reducers"
import {
  handleAuthConflictResolution,
  normalizeStoredCampaign,
  getUserStorageKey,
  getCampaignStorageKey,
} from "../utils"

interface UseAuthStateResult {
  jwt: string | null
  client: ReturnType<typeof Client>
  user: User
  state: typeof initialUserState
  dispatch: React.Dispatch<Parameters<typeof userReducer>[1]>
  loading: boolean
  error: string | null
  hasFetched: React.MutableRefObject<boolean>
  refreshUser: () => Promise<void>
}

interface UseAuthStateProps {
  initialUser?: User | null
  setCampaign: (campaign: Campaign | null) => void
}

/**
 * Internal hook for authentication state management.
 *
 * Handles:
 * - JWT discovery from localStorage/cookies
 * - User state via reducer
 * - Initial data fetch with cache validation
 * - Auth conflict detection and resolution
 * - User refresh functionality
 *
 * @param props - Configuration including initial user and campaign setter
 * @returns Auth state and management functions
 */
export function useAuthState({
  initialUser,
  setCampaign,
}: UseAuthStateProps): UseAuthStateResult {
  const [state, dispatch] = useReducer(userReducer, {
    ...initialUserState,
    user: initialUser || defaultUser,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const jwt =
    (typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null) ||
    Cookies.get("jwtToken") ||
    null

  const client = useMemo(() => Client({ jwt: jwt || undefined }), [jwt])
  const hasFetched = useRef(false)

  // Initial data fetch with cache validation
  useEffect(() => {
    if (!jwt || hasFetched.current) return

    const hasValidUser = state.user.id && state.user.id !== defaultUser.id

    // Only skip fetch if we have both a valid user AND a valid cached campaign
    if (hasValidUser) {
      try {
        const cachedCampaign = localStorage.getItem(
          getCampaignStorageKey(state.user.id)
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
            setLoading(false)
            hasFetched.current = true
            return
          }
        }
      } catch {
        // If campaign cache is invalid or parsing fails, fall through to fetch
      }
    }

    hasFetched.current = true

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const cachedUser = localStorage.getItem(getUserStorageKey(jwt!))
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser)
          const expectedUserId = Cookies.get("userId")

          // Validate cached user matches expected user
          if (
            parsedUser &&
            parsedUser.id !== defaultUser.id &&
            parsedUser.id === expectedUserId
          ) {
            dispatch({ type: UserActions.USER, payload: parsedUser })
            // Use cached campaign for immediate display
            const cachedCampaign = localStorage.getItem(
              getCampaignStorageKey(parsedUser.id)
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
              }
            }
          } else if (
            parsedUser &&
            expectedUserId &&
            parsedUser.id !== expectedUserId
          ) {
            console.warn("🔧 Cache mismatch detected, clearing user cache")
            localStorage.removeItem(getUserStorageKey(jwt!))
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

            handleAuthConflictResolution(jwt, client)
            return
          }
        }

        dispatch({ type: UserActions.USER, payload: userData })
        localStorage.setItem(getUserStorageKey(jwt!), JSON.stringify(userData))

        // Load cached campaign for immediate display
        const cachedCampaign = localStorage.getItem(
          getCampaignStorageKey(userData.id)
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
          }
        }

        // Always fetch fresh campaign data from API
        const campaignResponse = await client.getCurrentCampaign()
        const { data: campaignData } = campaignResponse || {}
        if (!campaignData) {
          setError("No campaign data available")
          setCampaign(defaultCampaign)
        } else {
          setCampaign(campaignData)
          localStorage.setItem(
            getCampaignStorageKey(userData.id),
            JSON.stringify(campaignData)
          )
        }
      } catch (error) {
        const statusCode = (error as { response?: { status?: number } })
          ?.response?.status

        if (statusCode === 401) {
          console.error("🔥 REMOVING JWT TOKEN - Authentication error:", error)
          Cookies.remove("jwtToken")
          setError("Authentication expired")
        } else if (statusCode === 404) {
          setCampaign(defaultCampaign)
        } else {
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
  }, [jwt, client, state.user.id, setCampaign])

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
        localStorage.setItem(getUserStorageKey(jwt), JSON.stringify(userData))
      } else {
        console.log("⚠️ No user data returned from API")
      }
    } catch (error) {
      console.error("⚠️ Failed to refresh user data:", error)
    }
  }, [jwt, client])

  return {
    jwt,
    client,
    user: state.user,
    state,
    dispatch,
    loading,
    error,
    hasFetched,
    refreshUser,
  }
}
