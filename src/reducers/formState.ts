"use client"

// @/reducers/index.tsx
import { useReducer, useMemo } from "react"

export enum FormActions {
  EDIT = "edit",
  OPEN = "open",
  SUBMIT = "submit",
  DISABLE = "disable",
  LOADING = "loading",
  ERROR = "error",
  ERRORS = "errors",
  STATUS = "status",
  SUCCESS = "success",
  UPDATE = "update",
  RESET = "reset",
}

interface EditAction {
  type: FormActions.EDIT
  name?: string
  value?: string | boolean | number
}

interface SubmitAction {
  type: FormActions.SUBMIT
}

interface UpdateAction {
  type: FormActions.UPDATE
  name: string
  value: unknown
}

interface OpenAction {
  type: FormActions.OPEN
  payload: boolean
}

interface DisableAction {
  type: FormActions.DISABLE
  payload: boolean
}

interface LoadingAction {
  type: FormActions.LOADING
  payload: boolean
}

interface ErrorAction {
  type: FormActions.ERROR
  name: string
  value: string | null
}

interface ErrorsAction {
  type: FormActions.ERRORS
  payload: string | null
}

interface StatusAction {
  type: FormActions.STATUS
  severity: string
  message: unknown
}

interface SuccessAction {
  type: FormActions.SUCCESS
  payload: string | null
}

interface ResetAction<T> {
  type: FormActions.RESET
  payload: FormStateType<T>
}

export interface FormStateType<T> {
  edited: boolean
  loading: boolean
  saving: boolean
  disabled: boolean
  open: boolean
  errors: { [key: string]: string }
  status: { severity: string; message: string } | null
  success: string | null
  data: T
}

export type FormStateAction<T> =
  | EditAction
  | SubmitAction
  | UpdateAction
  | OpenAction
  | DisableAction
  | LoadingAction
  | ErrorAction
  | ErrorsAction
  | StatusAction
  | SuccessAction
  | ResetAction<T>

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
      return action.payload
    }
    default: {
      return state
    }
  }
}

export function useForm<T extends Record<string, unknown>>(initialData: T) {
  const initialFormState = initializeFormState<T>(initialData)
  const [formState, dispatchForm] = useReducer(formReducer<T>, initialFormState)
  // Memoize formState to ensure stability, but make sure data changes trigger updates
  const memoizedFormState = useMemo(
    () => ({
      ...formState,
      data: formState.data,
    }),
    [formState.data, formState.loading, formState.error, formState.edited, formState.saving, formState.disabled, formState.open, formState.errors, formState.status, formState.success]
  )
  return { formState: memoizedFormState, dispatchForm, initialFormState }
}
