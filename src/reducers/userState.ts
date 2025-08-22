import { defaultUser, type User } from "@/types"
import { UserActions, UserStateType, UserStateAction } from "@/types"

// Re-export types and enums for backward compatibility
export { UserActions } from "@/types"
export type { UserStateType, UserStateAction } from "@/types"

export const initialUserState: UserStateType = {
  edited: false,
  saving: false,
  user: defaultUser,
}

export function userReducer(
  state: UserStateType,
  action: UserStateAction
): UserStateType {
  switch (action.type) {
    case UserActions.EDITED: {
      return {
        ...state,
        edited: true,
      }
    }
    case UserActions.UPDATE: {
      return {
        ...state,
        edited: true,
        user: {
          ...state.user,
          [action.name]: action.value,
        } as User,
      }
    }
    case UserActions.SUBMIT: {
      return {
        ...state,
        edited: false,
        saving: true,
      }
    }
    case UserActions.USER: {
      return {
        ...state,
        saving: false,
        edited: false,
        user: action.payload,
      }
    }
    case UserActions.RESET: {
      return {
        ...state,
        saving: false,
      }
    }
    default: {
      return initialUserState
    }
  }
}
