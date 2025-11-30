"use client"

// @/reducers/index.tsx
import { useReducer, useMemo } from "react"
import { FormActions, FormStateType, FormStateAction } from "@/types"

// Re-export types for backward compatibility
export { FormActions } from "@/types"
export type { FormStateType, FormStateAction } from "@/types"

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
