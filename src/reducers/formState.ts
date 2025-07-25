import { useReducer } from "react"

export enum FormActions {
  EDIT = "edit",
  OPEN = "open",
  SUBMIT = "submit",
  DISABLE = "disable",
  LOADING = "loading",
  ERROR = "error",
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
  value: any
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
  payload: string | null
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
  error: string | null
  success: string | null
  formData: T
}

export type FormStateAction<T> =
  | EditAction
  | SubmitAction
  | UpdateAction
  | OpenAction
  | DisableAction
  | LoadingAction
  | ErrorAction
  | SuccessAction
  | ResetAction<T>

export function initializeFormState<T extends Record<string, unknown>>(
  formData: T | null = null
): FormStateType<T> {
  return {
    edited: false,
    loading: true,
    saving: false,
    disabled: true,
    open: false,
    error: null,
    success: null,
    formData: formData ?? ({} as T),
  }
}

export function formReducer<T extends Record<string, unknown>>(
  state: FormStateType<T>,
  action: FormStateAction<T>
): FormStateType<T> {
  switch (action.type) {
    case FormActions.EDIT:
      if (action.name && action.value !== undefined) {
        return {
          ...state,
          edited: true,
          loading: false,
          formData: {
            ...state.formData,
          } as T,
          [action.name]: action.value,
        }
      }
      return {
        ...state,
        edited: true,
      }
    case FormActions.UPDATE:
      console.log("FormReducer UPDATE", action.name, action.value)
      return {
        ...state,
        edited: true,
        disabled: false,
        loading: false,
        saving: false,
        formData: {
          ...state.formData,
          [action.name]: action.value,
        } as T,
      }
    case FormActions.OPEN:
      return {
        ...state,
        open: action.payload,
      }
    case FormActions.DISABLE:
      return {
        ...state,
        disabled: action.payload,
      }
    case FormActions.LOADING:
      return {
        ...state,
        loading: action.payload,
      }
    case FormActions.ERROR:
      return {
        ...state,
        disabled: true,
        saving: false,
        loading: false,
        error: action.payload,
        success: null,
      }
    case FormActions.SUCCESS:
      return {
        ...state,
        disabled: false,
        saving: false,
        loading: false,
        error: null,
        success: action.payload,
      }
    case FormActions.SUBMIT:
      return {
        ...state,
        error: null,
        success: null,
        edited: false,
        saving: true,
      }
    case FormActions.RESET:
      return action.payload
    default:
      return state
  }
}

export function useForm<T extends Record<string, unknown>>(initialData: T) {
  const initialFormState = initializeFormState<T>(initialData)
  const [formState, dispatchForm] = useReducer(formReducer<T>, initialFormState)
  return { formState, dispatchForm, initialFormState }
}
