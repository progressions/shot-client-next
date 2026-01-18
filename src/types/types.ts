/**
 * Legacy types.ts file - maintained for backward compatibility
 *
 * This file now re-exports types from the new organized structure:
 * - API types from api.ts
 * - UI types from ui.ts
 * - Plus some types that remain here for now
 */

// Re-export API types
export type {
  ServerErrorResponse,
  ApiErrorResponse,
  HttpError,
  ConfirmationResponse,
  CampaignCableData,
  CableData,
  FightChannelMessage,
  Viewer,
  SessionData,
  NotionPage,
  ParametersType,
  QueryType,
} from "./api"

// Re-export UI types
export type {
  EditorChangeEvent,
  Toast,
  Severity,
  OptionType,
  FilterParametersType,
  InputParametersType,
  PasswordWithConfirmation,
  CharacterFilter,
  ErrorMessages,
  ImagePosition,
  Location,
  Shot,
  Archetype,
  WeaponCategory,
  SchtickCategory,
  SchtickPath,
  Invitation,
  FightEvent,
  ShotType,
  CollectionKey,
  CollectionItemMap,
  BaseEntity,
  HasCollection,
} from "./ui"

// Re-export resource types
export type {
  Entity,
  Character,
  User,
  Campaign,
  Fight,
  Site,
  Vehicle,
  Faction,
  Juncture,
  Party,
  Weapon,
  Schtick,
  CharacterType,
  Person,
  ActionValues,
  SkillValues,
  Advancement,
  ChaseRelationship,
} from "./resources"

// Re-export default factory data used across tests and services
export {
  defaultCharacter,
  defaultVehicle,
  defaultFight,
  defaultWeapon,
  defaultSchtick,
  defaultUser,
  defaultCampaign,
  defaultParty,
  defaultFaction,
} from "./defaults"

// Re-export character enums
export { CharacterTypes } from "./character"

// Types that remain in this file for now
export interface CharacterJson {
  name: string
  type: import("./resources").CharacterType
  description: string
  mainAttack: string
  attackValue: number
  defense: number
  toughness: number
  speed: number
  fortune: number
  task: string
  keywords: string[]
  skills: string[]
  weapons: string[]
  schticks: string[]
  summary: string
  wealth: number
  created_at: string
  juncture: string
  faction: string
  campaign: string
  color: string
  active: boolean
}

export interface VehicleActionValues {
  [key: string]: number | string
  Acceleration: number
  Maneuverability: number
  TopSpeed: number
  Frame: number
  Crunch: number
}

export interface VehicleDescription {
  passengers: number
  cargo_capacity: string
  cost: number
  fuel_type: string
  mpg: number
  availability: string
  notes: string
}

// Game roll structure
export interface Swerve {
  result: number
  positiveRolls: number[]
  negativeRolls: number[]
  positive: number
  negative: number
  boxcars: boolean
}

export interface FormStateData {
  drawerOpen: boolean
  edit?: boolean
  currentChar?: import("./resources").Character
  showDeleteDialog?: boolean
  saving?: boolean
  errors?: { [key: string]: string }
  success?: string
  edited?: boolean
}

export interface MetaType {
  [key: string]: number
}

export interface PaginationMeta {
  current_page: number
  total_pages: number
  per_page: number
  total_count: number
}

export interface CacheRefreshType {
  [key: string]: string
}
