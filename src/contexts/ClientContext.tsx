"use client"

import { type ActionDispatch, useReducer, useEffect, useMemo, createContext, useContext, useRef } from "react"
import Cookies from "js-cookie"
import Client from "@/lib/Client"
import { defaultUser, type User } from "@/types/types"
import { UserStateAction, UserActions, userReducer, initialUserState } from "@/reducers/userState"
import type { UserStateType } from "@/reducers/userState"

interface ClientContextType {
  client: Client
  jwt: string
  user: User
  currentUserState: UserStateType
  dispatchCurrentUser: ActionDispatch<[action: UserStateAction]>
}

interface ClientProviderProps {
  children: React.ReactNode
  initialUser?: User // Add optional initialUser prop
}

const ClientContext = createContext<ClientContextType>({
  client: new Client(),
  jwt: "",
  user: defaultUser,
  currentUserState: initialUserState,
  dispatchCurrentUser: () => {}
})

export function ClientProvider({ children, initialUser }: ClientProviderProps) {
  const [state, dispatch] = useReducer(userReducer, {
    ...initialUserState,
    user: initialUser || defaultUser // Use initialUser if provided
  })

  const jwt = Cookies.get("jwtToken") ?? ""
  const client = useMemo(() => new Client({ jwt }), [jwt])

  const hasFetchedRef = useRef(false)

  useEffect(() => {
    async function fetchUser() {
      if (!jwt || hasFetchedRef.current || state.user.id) return // Skip if initialUser provided or fetched

      hasFetchedRef.current = true
      try {
        const user = await client.getCurrentUser()
        dispatch({ type: UserActions.USER, payload: user })
      } catch (err) {
        console.error("Failed to fetch user", err)
        Cookies.remove("jwtToken")
      }
    }

    fetchUser()
  }, [jwt, client, state.user.id])

  return (
    <ClientContext.Provider value={{ client, jwt, user: state.user, currentUserState: state, dispatchCurrentUser: dispatch }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient(): ClientContextType {
  return useContext(ClientContext)
}
