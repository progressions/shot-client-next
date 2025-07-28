import { NextApiRequest, NextApiResponse } from 'next'

export type EditorChangeEvent = {
  target: {
    name: string
    value: string
  }
}

export type NotionPage = {
  id: string
}

export type BackendErrorResponse = {
  name?: string[]
  error?: string
  errors?: Record<string, string[]>
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
  status: 'preview_ready' | 'error'
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

export interface PopupProps {
  id: string
  data?: object
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

export type ExplodingDiceRolls = [
  number[],
  number
]

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

export interface Party {
  id?: string
  name: string
  description?: string
  faction?: Faction | null
  faction_id?: string | null
  characters: Character[]
  vehicles: Vehicle[]
  secret: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Faction {
  id?: string
  name: string
  description?: string
  characters: Character[]
  vehicles: Vehicle[]
  active: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface SuggestionsResponse {
  Character: Character[]
  Vehicle: Vehicle[]
  Party: Party[]
  Faction: Faction[]
  Site: Site[]
  Schtick: Schtick[]
  Weapon: Weapon[]
  meta: PaginationMeta
}

export interface PartiesResponse {
  parties: Party[]
  factions: Faction[]
  meta: PaginationMeta
}

export interface FactionsResponse {
  factions: Faction[]
  meta: PaginationMeta
}

export interface SitesResponse {
  sites: Site[]
  factions: Faction[]
  meta: PaginationMeta
}

export interface JuncturesResponse {
  junctures: Juncture[]
  factions: Faction[]
  meta: PaginationMeta
}

export interface SchticksResponse {
  schticks: Schtick[]
  meta: PaginationMeta
  paths: SchtickPath[]
  categories: SchtickCategory[]
}

export interface WeaponsResponse {
  weapons: Weapon[]
  meta: PaginationMeta
  junctures: string[]
  categories: WeaponCategory[]
}

export interface FightsResponse {
  fights: Fight[]
  meta: PaginationMeta
}

export interface CharactersResponse {
  characters: Character[]
  meta: PaginationMeta
  factions: Faction[]
  archetypes: Archetype[]
}

export interface VehiclesResponse {
  vehicles: Vehicle[]
  meta: PaginationMeta
}

export interface CharactersAndVehiclesResponse {
  characters: Character[]
  meta: PaginationMeta
  factions: Faction[]
}

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

export interface FilterParamsType {
  getOptionLabel: (option: string | OptionType) => string
  inputValue: string
}

export type Severity = 'error' | 'info' | 'success' | 'warning'

export type WeaponCategory = string
export type SchtickCategory = string
export type SchtickPath = string

export interface CampaignsResponse {
  gamemaster: Campaign[]
  player: Campaign[]
}

export interface PaginationMeta {
  current_page: number
  next_page: number | null
  prev_page: number | null
  total_pages: number
  total_count: number
}

export interface InputParamsType {
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

export interface Campaign {
  id?: string
  name: string
  description: string
  gamemaster: User
  new?: boolean
  players: User[]
  invitations: Invitation[]
}

export type JunctureName = string

export interface Weapon {
  id?: string
  name: string
  description: string
  damage: number
  concealment: number
  reload_value: number
  category: WeaponCategory
  juncture: JunctureName
  mook_bonus: number
  kachunk: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

// Enum definition for description keys
export enum DescriptionKeys {
  Nicknames = "Nicknames",
  Age = "Age",
  Height = "Height",
  Weight = "Weight",
  HairColor = "Hair Color",
  EyeColor = "Eye Color",
  StyleOfDress = "Style of Dress",
  Appearance = "Appearance",
  Background = "Background",
  MelodramaticHook = "Melodramatic Hook",
}

// Type for DescriptionValues
export type DescriptionValues = {
  [key in DescriptionKeys]: string
}

export interface AVs {
  [key: string]: string | number | null | undefined | boolean
}

export interface ActionValues {
  [key: string]: string | number | null | undefined | boolean
  Guns?: number
  "Martial Arts"?: number
  Sorcery?: number
  Scroungetech?: number
  Genome?: number
  Creature?: number
  Defense?: number
  Toughness?: number
  Speed?: number
  Fortune?: number
  "Max Fortune"?: number
  FortuneType?: string
  MainAttack?: string
  SecondaryAttack?: string | null
  Wounds: number
  Type?: CharacterType
  Damage?: number
  Vehicle?: boolean
  "Marks of Death": number
  Archetype: Archetype
}

export type SkillValue = [string, number] | [string, undefined]

export interface SkillValues {
  [key: string]: number | undefined
  Deceit?: number
  Detective?: number
  Driving?: number
  "Fix-It"?: number
  Gambling?: number
  Intimidation?: number
  Intrusion?: number
  Leadership?: number
  Medicine?: number
  Police?: number
  Sabotage?: number
  Seduction?: number
  Constitution?: number
  Defense?: number
  Melodrama?: number
  Will?: number
  Notice?: number
  Strength?: number
}

export interface VehicleActionValues {
  [key: string]: string | number | Position | CharacterType | undefined | boolean
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

export interface Schtick {
  id?: string
  name: string
  description: string
  campaign_id: string
  category: SchtickCategory
  path: SchtickPath
  schtick_id: string
  prerequisite: {
    id?: string
    name?: string
  }
  color: string
  image_url: string | null
  created_at: string
  updated_at: string
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

export type CharacterType = "PC" | "Ally" | "Mook" | "Featured Foe" | "Boss" | "Uber-Boss"

export interface ID {
  id: string
}

export type Character = Vehicle | Person
export type CharacterCategory = "character" | "vehicle"

export interface Vehicle {
  id?: string
  name: string
  active: boolean
  current_shot?: number | string
  impairments: number
  color: string
  action_values: AVs | VehicleActionValues
  description: DescriptionValues
  faction_id: string | null
  faction: Faction
  schticks: Schtick[]
  advancements: Advancement[]
  sites: Site[]
  weapons: Weapon[]
  skills: SkillValues
  user?: User
  user_id?: string
  created_at?: string
  updated_at?: string
  new?: boolean
  category: CharacterCategory
  count: number
  shot_id: string
  driver?: Character
  location?: string
  image_url: string | null
  task: boolean
  notion_page_id: string | null
  driving?: Vehicle
  wealth: string
  juncture_id: string | null
  juncture: Juncture | null
}

export interface Person {
  id?: string
  name: string
  active: boolean
  current_shot?: number | string
  impairments: number
  color: string
  faction_id: string | null
  faction: Faction
  action_values: AVs | ActionValues
  description: DescriptionValues
  schticks: Schtick[]
  skills: SkillValues
  advancements: Advancement[]
  sites: Site[]
  weapons: Weapon[]
  user?: User
  user_id?: string
  created_at?: string
  updated_at?: string
  new?: boolean
  category: CharacterCategory
  count: number
  shot_id: string
  driver?: Character
  location?: string
  image_url: string | null
  task: boolean
  notion_page_id: string | null
  driving?: Vehicle
  wealth: string
  juncture_id: string | null
  juncture: Juncture | null
}

export interface Advancement {
  id?: string
  description: string
}

export interface Site {
  id?: string
  name: string
  description?: string
  faction?: Faction | null
  faction_id: string | null
  characters: Character[]
  secret: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Juncture {
  id?: string
  name: string
  description?: string
  faction?: Faction | null
  faction_id: string | null
  characters: Character[]
  active: boolean
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Effect {
  id?: string
  name: string
  description: string
  severity: Severity
  start_sequence: number
  end_sequence: number
  start_shot: number
  end_shot: number
}

export interface CharacterEffect {
  id?: string
  name: string
  description?: string
  character_id?: string
  vehicle_id?: string
  severity: Severity
  change?: string
  action_value?: string
  shot_id?: string
}

export type ShotType = [number, Character[]]

interface CharacterEffects {
  [key: string]: CharacterEffect[]
}

export interface FightEvent {
  id?: string
  fight_id?: string
  event_type: string
  description: string
  details?: object
  created_at?: string
}

export interface Fight {
  id?: string
  active: boolean
  name?: string
  description?: string
  gamemaster?: User
  sequence: number
  effects: Effect[]
  characters?: Character[]
  vehicles?: Vehicle[]
  shot_order: ShotType[]
  character_effects: CharacterEffects
  vehicle_effects: CharacterEffects
  created_at?: string
  updated_at?: string
  actors: Character[]
  fight_events?: FightEvent[]
  image_url: string | null
}

export interface User {
  id?: string
  email: string
  password?: string
  name: string
  first_name?: string
  last_name?: string
  gamemaster?: boolean
  admin?: boolean
  image_url?: string | null
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

export interface ParamsType {
  [key: string]: string
  id: string
}

export interface QueryType {
  [key: string]: string | undefined
  confirmation_token?: string
  reset_password_token?: string
}

export interface ServerSideProps {
  req: NextApiRequest
  res: NextApiResponse
  params?: ParamsType
  query?: QueryType
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
