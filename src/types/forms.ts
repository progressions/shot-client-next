import { PaginationMeta } from "./types"

/**
 * Generic table/form state data structure for resource tables
 * Used across all Table components to eliminate duplication
 */
export interface TableFormState {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  drawerOpen: boolean
}

/**
 * Specific table form states for each resource type
 */
export interface WeaponsTableFormState extends TableFormState {
  weapons: import("./resources").Weapon[]
}

export interface CharactersTableFormState extends TableFormState {
  characters: import("./resources").Character[]
}

export interface CampaignsTableFormState extends TableFormState {
  campaigns: import("./resources").Campaign[]
}

export interface SchtickTableFormState extends TableFormState {
  schticks: import("./resources").Schtick[]
}

export interface SitesTableFormState extends TableFormState {
  sites: import("./resources").Site[]
}

export interface JuncturesTableFormState extends TableFormState {
  junctures: import("./resources").Juncture[]
}

export interface VehiclesTableFormState extends TableFormState {
  vehicles: import("./resources").Vehicle[]
}

export interface FactionsTableFormState extends TableFormState {
  factions: import("./resources").Faction[]
}

export interface PartiesTableFormState extends TableFormState {
  parties: import("./resources").Party[]
}

export interface FightsTableFormState extends TableFormState {
  fights: import("./resources").Fight[]
}

export interface UsersTableFormState extends TableFormState {
  users: import("./resources").User[]
}

/**
 * Form-related types for various UI components
 */
export interface FormDrawerState {
  drawerOpen: boolean
}

export interface FormSubmissionState {
  isSubmitting: boolean
  hasSubmitted: boolean
  submitError?: string
}

export interface FormValidationState {
  isValid: boolean
  validationErrors: Record<string, string[]>
}

/**
 * Generic form state that includes validation and submission state
 */
export interface FormState<T> extends FormSubmissionState, FormValidationState {
  data: T
  originalData?: T
  hasChanges: boolean
}
