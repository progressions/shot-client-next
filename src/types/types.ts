import {
  Campaign,
  CharacterType,
  Person,
  CharacterEffects,
  User,
  Fight,
  Site,
  Vehicle,
  Faction,
  Juncture,
  Party,
  Weapon,
  Schtick,
  Character,
  ActionValues,
  SkillValues,
} from "@/types"

type EntityReturnValue =
  | string
  | string[]
  | boolean
  | number
  | number[]
  | Entity
  | Entity[]
  | null
  | undefined
  | Invitation
  | Invitation[]
  | FightEvent
  | FightEvent[]
  | Advancement
  | Advancement[]
  | ErrorMessages
  | ShotType
  | ShotType[]
  | CharacterEffects
  | VehicleActionValues
  | ActionValues
  | SkillValues

export type BaseEntity = {
  [key: string]: EntityReturnValue
  id: string
  name: string
  image_url: string
  created_at: string
  updated_at: string
}

export type Entity =
  | Fight
  | Character
  | User
  | Site
  | (Vehicle & { action_values: VehicleActionValues })
  | (Person & { action_values: ActionValues })
  | Faction
  | Juncture
  | Party
  | Weapon
  | Schtick

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
  characters: Character
  parties: Party
  junctures: Juncture
  sites: Site
  weapons: Weapon
  factions: Faction
  schticks: Schtick
}

// Generic interface for entities that have a specific collection
export interface HasCollection<K extends CollectionKey> extends BaseEntity {
  [key: string]: EntityReturnValue // Allows additional properties to avoid conflicts with existing types
  collectionItems?: CollectionItemMap[K][] // e.g., entity.collectionItems is Character[] for K="characters"
  collectionIds?: string[] // e.g., entity.collectionIds is string[] for characters_ids
}

export type EditorChangeEvent = {
  target: {
    name: string
    value: string
  }
}

export type NotionPage = {
  id: string
}

export interface CampaignCableData {
  fight: Fight | null
  character: Character | null
  campaign: Campaign | null
  user: User | null
  vehicle: Vehicle | null
  faction: Faction | null
  juncture: Juncture | null
  party: Party | null
  site: Site | null
  weapon: Weapon | null
  schtick: Schtick | null
  campaigns: Campaign[] | string | null
  fights: Fight[] | string | null
  junctures: Juncture[] | string | null
  factions: Faction[] | string | null
  characters: Character[] | string | null
  vehicles: Vehicle[] | string | null
  parties: Party[] | string | null
  sites: Site[] | string | null
  schticks: Schtick[] | string | null
  weapons: Weapon[] | string | null
}

export interface CableData {
  status: "preview_ready" | "error"
  json?: CharacterJson
  error?: string
}

export interface CharacterJson {
  name: string
  type: CharacterType
  description: string
  mainAttack: string
  attackValue: number
  defense: number
  toughness: number
  speed: number
  damage: number
  nicknames: string
  age: string
  height: string
  weight: string
  hairColor: string
  eyeColor: string
  styleOfDress: string
  appearance: string
  melodramaticHook: string
  faction: string
  juncture: string
  wealth: string
}

export interface PopupProperties {
  id: string
  data?: object | object[]
}

export interface VehicleArchetype {
  name: string
  Acceleration: number
  Handling: number
  Squeal: number
  Frame: number
  Crunch: number
}

export interface AttackRoll {
  boxcars: boolean
  wayAwfulFailure: boolean
  swerve: number
  actionResult: number
  outcome?: number
  success?: boolean
  smackdown?: number
  wounds?: number
}

export type ExplodingDiceRolls = [number[], number]

export interface Swerve {
  result: number
  positiveRolls: number[]
  negativeRolls: number[]
  positive: number | null
  negative: number | null
  boxcars: boolean
}

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

export interface ErrorMessages {
  [key: string]: string
}

export interface SessionData {
  authorization: object
  user?: User
}

export interface OptionType {
  inputValue: string
}

export interface FilterParametersType {
  getOptionLabel: (option: string | OptionType) => string
  inputValue: string
}

export type Severity = "error" | "info" | "success" | "warning"

export type WeaponCategory = string
export type SchtickCategory = string
export type SchtickPath = string

export interface InputParametersType {
  [key: string]: unknown
}

export interface PasswordWithConfirmation {
  password: string
  password_confirmation: string
}

export interface Toast {
  open: boolean
  message: string
  severity: Severity
}

export interface VehicleActionValues {
  [key: string]:
    | string
    | number
    | Position
    | CharacterType
    | undefined
    | boolean
  Acceleration: number
  Handling: number
  Squeal: number
  Frame: number
  Crunch: number
  "Chase Points": number
  "Condition Points": number
  Position: Position
  Pursuer: Pursuer
  Type: CharacterType
}
export enum Positions {
  Near = "near",
  Far = "far",
}

export type Position = "near" | "far"

export type Pursuer = "true" | "false"

export enum CharacterTypes {
  PC = "PC",
  Ally = "Ally",
  Mook = "Mook",
  FeaturedFoe = "Featured Foe",
  Boss = "Boss",
  UberBoss = "Uber-Boss",
}

export interface ID {
  id: string
}

export interface Advancement {
  id?: string
  description: string
}

export type ShotType = [number, Character[]]

export interface FightEvent {
  id?: string
  fight_id?: string
  event_type: string
  description: string
  details?: object
  created_at?: string
}
export interface Invitation {
  id?: string
  email?: string
  campaign_id?: string
  campaign?: Campaign
  maximum_count: number
  remaining_count: number
  pending_user: User
}

export interface CharacterFilter {
  type: string | null
  name: string | null
}

export interface ParametersType {
  [key: string]: string
  id: string
}

export interface QueryType {
  [key: string]: string | undefined
  confirmation_token?: string
  reset_password_token?: string
}

export interface Viewer {
  id: string
  first_name?: string
  last_name?: string
  name: string
  image_url?: string | null
}

export interface FightChannelMessage {
  fight?: "updated" | Fight
  users?: Viewer[]
}
