/**
 * User State Reducer
 *
 * Provides reducer-based state management for user profile editing.
 * Handles user data updates, form submission state, and profile persistence.
 *
 * @module reducers/userState
 */

import { defaultUser, type User } from "@/types"
import { UserActions, UserStateType, UserStateAction } from "@/types"

// Re-export types and enums for backward compatibility
export { UserActions } from "@/types"
export type { UserStateType, UserStateAction } from "@/types"

/**
 * Default initial state for user reducer.
 *
 * Initial state:
 * - `edited: false` - User data has not been modified
 * - `saving: false` - Not currently saving to server
 * - `user: defaultUser` - Empty user object with default values
 */
export const initialUserState: UserStateType = {
  edited: false,
  saving: false,
  user: defaultUser,
}

/**
 * Reducer function for user state management.
 *
 * Handles the following action types:
 *
 * | Action | Effect |
 * |--------|--------|
 * | `EDITED` | Marks user data as modified |
 * | `UPDATE` | Updates a single user field, marks as edited |
 * | `SUBMIT` | Clears edited flag, sets saving state |
 * | `USER` | Replaces user data, clears saving/edited states |
 * | `RESET` | Clears saving state only |
 *
 * @param state - Current user state
 * @param action - Action to dispatch
 * @returns Updated user state
 *
 * @example
 * ```tsx
 * const [userState, dispatchUser] = useReducer(userReducer, initialUserState)
 *
 * // Update a field
 * dispatchUser({ type: UserActions.UPDATE, name: "first_name", value: "John" })
 *
 * // Submit changes
 * dispatchUser({ type: UserActions.SUBMIT })
 *
 * // Set user after API response
 * dispatchUser({ type: UserActions.USER, payload: updatedUser })
 * ```
 */
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
