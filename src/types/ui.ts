import type { User } from "@/types/resources"

/**
 * UI Component Types
 * Types specific to UI components, forms, and user interface elements
 */

export interface EditorChangeEvent {
  target: {
    name: string
    value: string
  }
}

export interface Toast {
  open: boolean
  message: string
  severity: "success" | "error" | "warning" | "info"
}

export type Severity = "error" | "info" | "success" | "warning"

/**
 * Form and Input Types
 */

export interface OptionType {
  inputValue: string
}

export interface FilterParametersType {
  getOptionLabel: (option: string | OptionType) => string
  inputValue: string
}

export interface InputParametersType {
  [key: string]: unknown
}

export interface PasswordWithConfirmation {
  password: string
  password_confirmation: string
}

export interface CharacterFilter {
  type: string | null
  name: string | null
}

export interface ErrorMessages {
  [key: string]: string
}

/**
 * Autocomplete and Selection Types
 */

export interface AutocompleteOption {
  id: string
  name: string
  label?: string
  value?: string | number | boolean | null
}

/**
 * Image and Position Types
 */

export interface ImagePosition {
  context: string
  x_position: number
  y_position: number
}

/**
 * Game UI Specific Types
 */

export interface Location {
  id?: string
  name: string
  shot?: Shot
}

export interface Shot {
  id?: string
  shot: number
}

export type Archetype = string
export type WeaponCategory = string
export type SchtickCategory = string
export type SchtickPath = string

/**
 * Invitation System Types
 */

export interface Invitation {
  id?: string
  email?: string
  campaign_id?: string
  campaign?: import("./resources").Campaign
  maximum_count: number
  remaining_count: number
  pending_user: User
}

/**
 * Fight Event Types
 */

export interface FightEvent {
  id?: string
  fight_id?: string
  event_type: string
  description: string
  details?: object
  created_at?: string
}

/**
 * Complex Game State Types
 */

export type ShotType = [number, import("./resources").Character[]]

/**
 * Collection and Entity Management Types
 */

// Union type of possible collection keys (matches autocompleteMap and badgeMap in ListManager)
export type CollectionKey =
  | "characters"
  | "parties"
  | "junctures"
  | "sites"
  | "weapons"
  | "factions"
  | "schticks"

// Maps each collection key to its corresponding item type
export interface CollectionItemMap {
  characters: import("./resources").Character
  parties: import("./resources").Party
  junctures: import("./resources").Juncture
  sites: import("./resources").Site
  weapons: import("./resources").Weapon
  factions: import("./resources").Faction
  schticks: import("./resources").Schtick
}

/**
 * Generic Entity Types
 */

type EntityReturnValue =
  | string
  | string[]
  | boolean
  | number
  | number[]
  | import("./resources").Entity
  | import("./resources").Entity[]
  | null
  | undefined
  | Invitation
  | Invitation[]
  | FightEvent
  | FightEvent[]
  | import("./resources").Advancement
  | import("./resources").Advancement[]
  | ErrorMessages
  | ShotType
  | ShotType[]
  | import("./character").CharacterEffects
  | import("./resources").VehicleActionValues
  | import("./resources").ActionValues
  | import("./resources").SkillValues

export interface BaseEntity {
  [key: string]: EntityReturnValue
  id: string
  name: string
  image_url: string
  created_at: string
  updated_at: string
  image_positions: ImagePosition[]
}

// Generic interface for entities that have a specific collection
export interface HasCollection<K extends CollectionKey> extends BaseEntity {
  [key: string]: EntityReturnValue // Allows additional properties to avoid conflicts with existing types
  collectionItems?: CollectionItemMap[K][] // e.g., entity.collectionItems is Character[] for K="characters"
  collectionIds?: string[] // e.g., entity.collectionIds is string[] for characters_ids
}
