import type { User } from "@/types/types"
import { defaultUser } from "@/types/types"

export enum UserActions {
  EDITED = "edited",
  UPDATE = "update",
  SUBMIT = "submit",
  USER = "user",
  RESET = "reset"
}

interface ActionNoPayload {
  type: Extract<UserActions, UserActions.EDITED | UserActions.SUBMIT | UserActions.RESET>
}

interface UpdateAction {
  type: Extract<UserActions, UserActions.UPDATE>
  name: string
  value: string | boolean | number
}

interface PayloadAction {
  type: Extract<UserActions, UserActions.USER>
  payload: User
}

export interface UserStateType {
  edited: boolean
  saving: boolean
  user: User
}

export type UserStateAction = ActionNoPayload | UpdateAction | PayloadAction

export const initialUserState:UserStateType = {
  edited: false,
  saving: false,
  user: defaultUser
}

export function userReducer(state: UserStateType, action: UserStateAction): UserStateType {
  switch(action.type) {
    case UserActions.EDITED:
      return {
        ...state,
        edited: true
      }
    case UserActions.UPDATE:
      return {
        ...state,
        edited: true,
        user: {
          ...state.user,
          [action.name as string]: action.value
        } as User
      }
    case UserActions.SUBMIT:
      return {
        ...state,
        edited: false,
        saving: true,
      }
    case UserActions.USER:
      return {
        ...state,
        saving: false,
        edited: false,
        user: action.payload as User
      }
    case UserActions.RESET:
      return {
        ...state,
        saving: false
      }
    default:
      return initialUserState
  }
}
