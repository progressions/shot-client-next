import { NextApiRequest, NextApiResponse } from 'next'
import { Session, User as NextAuthUser } from "next-auth"
import { AlertColor } from "@mui/material"

export type BackendErrorResponse = {
  name?: string[]
  error?: string
  errors?: Record<string, string[]>
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
  data?: any
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
  characters: Character[]
  vehicles: Vehicle[]
  secret: boolean
  image_url: string | null
}

export interface Faction {
  id?: string
  name: string
  description?: string
  characters: Character[]
  vehicles: Vehicle[]
  active: boolean
  image_url: string | null
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

export interface CharactersAndVehiclesResponse {
  characters: Character[]
  meta: PaginationMeta
  factions: Faction[]
}

export interface ErrorMessages {
  [key: string]: string
}

export interface AuthUser extends NextAuthUser {
  authorization: string | null
  admin: boolean
}

export interface SessionData {
  authorization: {}
  user?: User | AuthUser
}

export interface AuthSession extends Session {
  authorization: {} | null
  id: {}
  status: "loading" | "unauthenticated" | "authenticated"
  data: SessionData | null
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
  description?: string
  gamemaster?: User
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
  characters?: Character[]
  secret: boolean
  image_url: string | null
}

export interface Juncture {
  id?: string
  name: string
  description?: string
  faction?: Faction | null
  characters?: Character[]
  active: boolean
  image_url: string | null
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
  details?: any
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
  actors?: Character[]
  fight_events?: FightEvent[]
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

export const defaultFaction:Faction = {
  id: "",
  name: "",
  description: "",
  characters: [],
  vehicles: [],
  active: true,
  image_url: null,
}

export const defaultCharacter:Person = {
  name: '',
  category: "character",
  active: true,
  current_shot: 0,
  impairments: 0,
  color: '',
  faction_id: null,
  faction: defaultFaction,
  action_values: {
    Archetype: "",
    Guns: 0,
    "Martial Arts": 0,
    Sorcery: 0,
    Scroungetech: 0,
    Genome: 0,
    Creature: 0,
    Defense: 0,
    Toughness: 0,
    Speed: 0,
    Fortune: 0,
    "Max Fortune": 0,
    FortuneType: "Fortune",
    MainAttack: "Guns",
    SecondaryAttack: null,
    Wounds: 0,
    Type: "Featured Foe",
    Vehicle: false,
    "Marks of Death": 0,
    Damage: 0,
  },
  description: {
    "Nicknames": "",
    "Age": "",
    "Height": "",
    "Weight": "",
    "Hair Color": "",
    "Eye Color": "",
    "Style of Dress": "",
    "Appearance": "",
    "Background": "",
    "Melodramatic Hook": ""
  },
  schticks: [],
  skills: {},
  advancements: [],
  sites: [],
  weapons: [],
  count: 0,
  shot_id: "",
  image_url: "",
  task: false,
  notion_page_id: null,
  wealth: "Poor",
  juncture_id: null,
  juncture: null
}

export const defaultVehicle:Vehicle = {
  name: '',
  active: true,
  category: "vehicle",
  current_shot: '',
  impairments: 0,
  color: '',
  faction_id: null,
  faction: defaultFaction,
  action_values: {
    Acceleration: 0,
    Handling: 0,
    Squeal: 0,
    Frame: 0,
    Crunch: 0,
    "Chase Points": 0,
    "Condition Points": 0,
    Pursuer: "true",
    Position: "far",
    Type: "Featured Foe",
  },
  description: {
    "Nicknames": "",
    "Age": "",
    "Height": "",
    "Weight": "",
    "Hair Color": "",
    "Eye Color": "",
    "Style of Dress": "",
    "Appearance": "",
    "Background": "",
    "Melodramatic Hook": ""
  },
  schticks: [],
  skills: {},
  advancements: [],
  sites: [],
  weapons: [],
  count: 0,
  shot_id: "",
  driver: defaultCharacter,
  image_url: "",
  task: false,
  notion_page_id: null,
  wealth: "",
  juncture_id: null,
  juncture: null
}

export const defaultFight:Fight = {
  name: "",
  description: "",
  active: true,
  sequence: 0,
  effects: [],
  characters: [],
  shot_order: [],
  character_effects: {},
  vehicle_effects: {}
}

export const defaultUser:User = {
  email: '',
  name: '',
}

export const defaultEffect:Effect = {
  name: "",
  description: "",
  severity: "error",
  start_sequence: 1,
  end_sequence: 2,
  start_shot: 15,
  end_shot: 15,
}

export const defaultToast:Toast = {
  open: false,
  message: "",
  severity: "success"
}

export const defaultCampaign:Campaign = {
  name: "",
  description: "",
  gamemaster: defaultUser,
  players: [],
  invitations: []
}

export const defaultCharacterEffect:CharacterEffect = {
  name: "",
  description: "",
  severity: "info",
  character_id: "",
  shot_id: ""
}

export const defaultSchtick:Schtick = {
  name: "",
  description: "",
  campaign_id: "",
  category: "",
  path: "",
  schtick_id: "",
  prerequisite: {
    id: "",
    name: ""
  },
  color: ""
}

export const defaultAdvancement:Advancement = {
  description: ""
}

export const defaultJuncture:Juncture = {
  name: "",
  description: "",
  faction: null,
  active: true,
  image_url: null
}

export const defaultSite:Site = {
  name: "",
  description: "",
  faction: null,
  secret: false,
  image_url: null
}

export const defaultParty:Party = {
  name: "",
  description: "",
  faction: null,
  characters: [],
  vehicles: [],
  secret: false,
  image_url: null
}

export const defaultWeapon:Weapon = {
  name: "",
  description: "",
  damage: 7,
  concealment: 0,
  reload_value: 0,
  juncture: "",
  category: "",
  mook_bonus: 0,
  kachunk: false,
  image_url: ""
}

export const defaultPaginationMeta:PaginationMeta = {
  current_page: 1,
  next_page: null,
  prev_page: null,
  total_pages: 1,
  total_count: 1
}

export const defaultLocation:Location = {
  name: ""
}

export const defaultSwerve:Swerve = {
  result: 0,
  positiveRolls: [],
  negativeRolls: [],
  positive: 0,
  negative: 0,
  boxcars: false,
}

