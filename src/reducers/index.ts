/**
 * Reducers Module
 *
 * Provides reducer-based state management patterns for forms and user data.
 * Re-exports all reducer functions, hooks, and types for convenient imports.
 *
 * @module reducers
 *
 * @example
 * ```tsx
 * import { useForm, FormActions, userReducer, UserActions } from "@/reducers"
 *
 * // Form management
 * const { formState, dispatchForm } = useForm({ name: "", email: "" })
 *
 * // User state management
 * const [userState, dispatchUser] = useReducer(userReducer, initialUserState)
 * ```
 */

// Re-export everything from state files
export * from "@/reducers/formState"
export * from "@/reducers/userState"

// Explicit re-exports for enums that may have issues with bundler
export { FormActions, UserActions } from "@/types"
