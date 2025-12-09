"use client"

/**
 * Form State Reducer
 *
 * Provides a reducer-based state management pattern for forms throughout the application.
 * Handles common form states: loading, saving, errors, validation, and success messages.
 *
 * @module reducers/formState
 */

import { useReducer, useMemo } from "react"
import { FormActions, FormStateType, FormStateAction } from "@/types"

// Re-export types for backward compatibility
export { FormActions } from "@/types"
export type { FormStateType, FormStateAction } from "@/types"

/**
 * Creates an initial form state object with default values.
 *
 * Initial state:
 * - `edited: false` - Form has not been modified
 * - `loading: true` - Form is loading data
 * - `saving: false` - Form is not currently saving
 * - `disabled: true` - Form inputs are disabled during load
 * - `open: false` - Modal/dialog is closed
 * - `errors: {}` - No validation errors
 * - `status: null` - No status message
 * - `success: null` - No success message
 *
 * @template T - The shape of the form data object
 * @param data - Optional initial data to populate the form
 * @returns Initialized form state with the provided data
 *
 * @example
 * ```tsx
 * const initial = initializeFormState({ name: "", email: "" })
 * // { edited: false, loading: true, saving: false, disabled: true, ... }
 * ```
 */
export function initializeFormState<T extends Record<string, unknown>>(
  data: T | null = null
): FormStateType<T> {
  return {
    edited: false,
    loading: true,
    saving: false,
    disabled: true,
    open: false,
    errors: {},
    status: null,
    success: null,
    data: data ?? ({} as T),
  }
}

/**
 * Reducer function for form state management.
 *
 * Handles the following action types:
 *
 * | Action | Effect |
 * |--------|--------|
 * | `EDIT` | Updates a single field, marks form as edited |
 * | `UPDATE` | Updates a field, enables form, clears saving state |
 * | `OPEN` | Toggles modal/dialog open state |
 * | `DISABLE` | Toggles disabled state |
 * | `LOADING` | Toggles loading state |
 * | `ERROR` | Sets a single field error, disables form |
 * | `ERRORS` | Sets multiple errors at once, disables form |
 * | `STATUS` | Sets a status message with severity |
 * | `SUCCESS` | Clears errors, sets success message, enables form |
 * | `SUBMIT` | Clears errors/success, sets saving state |
 * | `RESET` | Resets to initial state with optional new data |
 *
 * @template T - The shape of the form data object
 * @param state - Current form state
 * @param action - Action to dispatch
 * @returns Updated form state
 *
 * @example
 * ```tsx
 * // Used internally by useForm hook
 * const [state, dispatch] = useReducer(formReducer, initialState)
 *
 * // Edit a field
 * dispatch({ type: FormActions.EDIT, name: "email", value: "user@example.com" })
 *
 * // Set validation errors
 * dispatch({ type: FormActions.ERRORS, payload: { email: "Invalid email" } })
 * ```
 */
export function formReducer<T extends Record<string, unknown>>(
  state: FormStateType<T>,
  action: FormStateAction<T>
): FormStateType<T> {
  switch (action.type) {
    case FormActions.EDIT: {
      if (action.name && action.value !== undefined) {
        return {
          ...state,
          edited: true,
          loading: false,
          data: {
            ...state.data,
            [action.name]: action.value,
          } as T,
        }
      }
      return {
        ...state,
        edited: true,
      }
    }
    case FormActions.UPDATE: {
      return {
        ...state,
        edited: true,
        disabled: false,
        saving: false,
        data: {
          ...state.data,
          [action.name]: action.value,
        } as T,
      }
    }
    case FormActions.OPEN: {
      return {
        ...state,
        open: action.payload,
      }
    }
    case FormActions.DISABLE: {
      return {
        ...state,
        disabled: action.payload,
      }
    }
    case FormActions.LOADING: {
      return {
        ...state,
        loading: action.payload,
      }
    }
    case FormActions.ERROR: {
      return {
        ...state,
        disabled: true,
        saving: false,
        loading: false,
        errors: {
          ...state.errors,
          [action.name]: action.value,
        },
        success: null,
      }
    }
    case FormActions.ERRORS: {
      return {
        ...state,
        disabled: true,
        saving: false,
        loading: false,
        errors: action.payload ?? {},
        success: null,
      }
    }
    case FormActions.STATUS: {
      return {
        ...state,
        status: {
          severity: action.severity,
          message: action.message as string,
        },
      }
    }
    case FormActions.SUCCESS: {
      return {
        ...state,
        disabled: false,
        saving: false,
        loading: false,
        errors: {},
        status: {
          severity: "success",
          message: action.payload || "Operation successful",
        },
        success: action.payload,
      }
    }
    case FormActions.SUBMIT: {
      return {
        ...state,
        errors: {},
        success: null,
        edited: false,
        saving: true,
        status: null,
      }
    }
    case FormActions.RESET: {
      // Ensure the payload is properly structured
      if (action.payload && action.payload.data) {
        return action.payload
      }
      // If payload is just the data, wrap it properly
      if (action.value) {
        return initializeFormState<T>(action.value as T)
      }
      return initializeFormState<T>({} as T)
    }
    default: {
      return state
    }
  }
}

/**
 * Hook for managing form state with loading, saving, errors, and validation.
 * Provides a reducer-based state management pattern for forms.
 *
 * @param initialData - Initial data object for the form
 *
 * @returns Object with:
 * - `formState` - Current form state (data, loading, saving, errors, status)
 * - `dispatchForm` - Dispatch function for form actions
 * - `initialFormState` - Reference to the initial state
 *
 * @example
 * ```tsx
 * const { formState, dispatchForm } = useForm({ entity: character })
 *
 * // Update a field
 * dispatchForm({ type: FormActions.EDIT, name: "name", value: "New Name" })
 *
 * // Submit form
 * dispatchForm({ type: FormActions.SUBMIT })
 *
 * // Handle success
 * dispatchForm({ type: FormActions.SUCCESS, payload: "Saved!" })
 *
 * // Handle errors
 * dispatchForm({ type: FormActions.ERRORS, payload: { name: "Required" } })
 * ```
 */
export function useForm<T extends Record<string, unknown>>(initialData: T) {
  const initialFormState = initializeFormState<T>(initialData)
  const [formState, dispatchForm] = useReducer(formReducer<T>, initialFormState)

  // Memoize formState to ensure stability, but make sure data changes trigger updates
  const memoizedFormState = useMemo(() => {
    if (!formState) {
      return initialFormState
    }
    return {
      ...formState,
      data: formState.data,
    }
  }, [formState, initialFormState])

  return { formState: memoizedFormState, dispatchForm, initialFormState }
}
