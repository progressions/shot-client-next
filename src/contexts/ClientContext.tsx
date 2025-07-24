"use client"

import { type ActionDispatch, useReducer, useEffect, useMemo, createContext, useContext } from "react"
import Cookies from "js-cookie"
import Client from "@/lib/Client"

import { defaultUser } from "@/types/types"
import type { User } from "@/types/types"
import { UserStateAction, UserActions, userReducer, initialUserState } from "@/reducers/userState"
import type { UserStateType } from "@/reducers/userState"
import { getUser } from "@/lib/getServerClient"

interface ClientContextType {
  client: Client
  jwt: string
  user: User
  currentUserState: UserStateType
  dispatchCurrentUser: ActionDispatch<[action: UserStateAction]>
}

interface ClientProviderProps {
  children: React.ReactNode
}

const ClientContext = createContext<ClientContextType>({ client: new Client(), jwt: "", user: defaultUser, currentUserState: initialUserState, dispatchCurrentUser: () => {} })

export function ClientProvider({ children }: ClientProviderProps) {
  const [state, dispatch] = useReducer(userReducer, initialUserState)

  const jwt = Cookies.get("jwtToken") ?? ""
  const client = useMemo(() => new Client({ jwt }), [jwt])

  useEffect(() => {
    getUser().then(user => {
      if (user) {
        dispatch({ type: UserActions.USER, payload: user })
      } else {
        Cookies.remove("jwtToken")
      }
    })
  }, [jwt, client, state.user.id])

  console.log("user", state.user)

  return (
    <ClientContext.Provider value={{ client, jwt, user: state.user, currentUserState: state, dispatchCurrentUser: dispatch }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient(): ClientContextType {
  return useContext(ClientContext)
}
