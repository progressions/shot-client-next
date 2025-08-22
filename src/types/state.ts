import { User } from "./resources"

/**
 * Form state management types
 * These types define the structure and actions for form state reducers
 */

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

export interface EditAction {
  type: FormActions.EDIT
  name?: string
  value?: string | boolean | number
}

export interface SubmitAction {
  type: FormActions.SUBMIT
}

export interface UpdateAction {
  type: FormActions.UPDATE
  payload: any
}

export interface OpenAction {
  type: FormActions.OPEN
  value?: boolean
}

export interface DisableAction {
  type: FormActions.DISABLE
  value?: boolean
}

export interface LoadingAction {
  type: FormActions.LOADING
  value?: boolean
}

export interface ErrorAction {
  type: FormActions.ERROR
  value?: string
}

export interface ErrorsAction {
  type: FormActions.ERRORS
  value?: { [key: string]: string }
}

export interface StatusAction {
  type: FormActions.STATUS
  value?: { severity: string; message: string } | null
}

export interface SuccessAction {
  type: FormActions.SUCCESS
  value?: string | null
}

export interface ResetAction<T> {
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

/**
 * User state management types
 */

export enum UserActions {
  EDITED = "edited",
  UPDATE = "update",
  SUBMIT = "submit",
  USER = "user",
  RESET = "reset",
}

export interface UserActionNoPayload {
  type: Extract<
    UserActions,
    UserActions.EDITED | UserActions.SUBMIT | UserActions.RESET
  >
}

export interface UserUpdateAction {
  type: Extract<UserActions, UserActions.UPDATE>
  name: string
  value: string | boolean | number
}

export interface UserPayloadAction {
  type: Extract<UserActions, UserActions.USER>
  payload: User
}

export interface UserStateType {
  edited: boolean
  saving: boolean
  user: User
}

export type UserStateAction =
  | UserActionNoPayload
  | UserUpdateAction
  | UserPayloadAction

/**
 * Context state types for global app state
 */

export interface AppState {
  user: User | null
  currentCampaign: import("./resources").Campaign | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ToastState {
  open: boolean
  message: string
  severity: "success" | "error" | "warning" | "info"
}

export interface EncounterState {
  currentFight: import("./resources").Fight | null
  shots: import("./resources").Shot[]
  isActive: boolean
  isLoading: boolean
}

/**
 * Local storage state types
 */

export interface LocalStorageState {
  currentCampaignId: string | null
  userPreferences: {
    theme: "light" | "dark" | "system"
    itemsPerPage: number
    defaultSort: string
  }
  cache: {
    timestamp: number
    data: Record<string, any>
  }
}
