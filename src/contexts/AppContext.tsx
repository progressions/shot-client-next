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
  loading: boolean
  error: string | null
}

interface AppProviderProperties {
  children: React.ReactNode
  initialUser?: User | null
}

const AppContext = createContext<AppContextType>({
  client: new Client(),
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
  const jwt = Cookies.get("jwtToken") ?? ""
  const client = useMemo(() => new Client({ jwt }), [jwt])
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
        console.log("Cached user:", cachedUser)
        if (cachedUser) {
          const parsedUser = JSON.parse(cachedUser)
          if (parsedUser && parsedUser.id !== defaultUser.id) {
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
          }
        }

        const userResponse = await client.getCurrentUser()
        const { data: userData } = userResponse || {}
        if (!userData) {
          setError("Failed to fetch user data")
          Cookies.remove("jwtToken")
          setLoading(false)
          return
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
        setError(
          "Failed to fetch user or campaign: " + (error as Error).message
        )
        Cookies.remove("jwtToken")
        setCampaign(defaultCampaign)
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
        connected: () => console.log("Connected to CampaignChannel"),
        disconnected: () => console.log("Disconnected from CampaignChannel"),
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

  // Process campaignData and trigger callbacks
  useEffect(() => {
    if (!campaignData) return

    Object.entries(campaignData).forEach(([key, value]) => {
      const callbacks = entityUpdateCallbacks.current.get(key)
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
  }, [campaignData])

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
        loading,
        error,
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
