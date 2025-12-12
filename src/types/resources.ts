import type {
  BaseEntity,
  Invitation,
  FightEvent,
  Severity,
  SchtickCategory,
  SchtickPath,
} from "./ui"
import type {
  Character,
  CharacterCategory,
  ActionValues,
  DescriptionValues,
  SkillValues,
} from "./character"
import type { VehicleActionValues } from "./types"
import type { OnboardingProgress } from "@/lib/onboarding"

export enum VehicleDescriptionKeys {
  Size = "Size",
  Weight = "Weight",
  Color = "Color",
  Appearance = "Appearance",
}

export type DescriptionValues = {
  [key in DescriptionKeys]: string
}

export interface Campaign extends BaseEntity {
  id: string
  name: string
  description: string
  gamemaster: User
  new?: boolean
  players: User[]
  player_ids: string[]
  invitations: Invitation[]
  image_url: string
  created_at: string
  updated_at: string
  // Seeding status fields
  seeding_status?: string | null
  seeding_images_total?: number
  seeding_images_completed?: number
  seeded_at?: string | null
  is_seeding?: boolean
  is_seeded?: boolean
}

export type JunctureName = string

export interface Weapon extends BaseEntity {
  id: string
  name: string
  description: string
  damage: number
  concealment: number
  reload_value: number
  category: WeaponCategory
  juncture: JunctureName
  mook_bonus: number
  kachunk: boolean
  image_url: string
  created_at: string
  updated_at: string
}

export interface Party extends BaseEntity {
  id: string
  name: string
  description?: string
  faction?: Faction | null
  faction_id: string | null
  characters: Character[]
  vehicles: Vehicle[]
  character_ids: string[]
  vehicle_ids: string[]
  image_url: string
  created_at: string
  updated_at: string
}

export interface Faction extends BaseEntity {
  id: string
  name: string
  description?: string
  characters: Character[]
  vehicles: Vehicle[]
  active: boolean
  parties: Party[]
  sites: Site[]
  junctures: Juncture[]
  character_ids: string[]
  vehicle_ids: string[]
  party_ids: string[]
  site_ids: string[]
  juncture_ids: string[]
  image_url: string
  created_at: string
  updated_at: string
}

export interface Schtick extends BaseEntity {
  id: string
  name: string
  description: string
  campaign_id: string
  category: SchtickCategory
  path: SchtickPath
  schtick_id: string
  prerequisite: {
    id: string
    name?: string
  }
  color: string
  image_url: string
  created_at: string
  updated_at: string
}

export interface Fight extends BaseEntity {
  id: string
  active: boolean
  name: string
  description?: string
  gamemaster?: User
  sequence: number
  effects: Effect[]
  characters?: Character[]
  vehicles?: Vehicle[]
  character_ids?: string[]
  vehicle_ids?: string[]
  character_effects: CharacterEffects
  vehicle_effects: CharacterEffects
  created_at: string
  updated_at: string
  fight_events?: FightEvent[]
  image_url: string
  started_at: string | null
  ended_at: string | null
  season: number | null
  session: number | null
}

export interface User extends BaseEntity {
  id: string
  email: string
  password?: string
  name: string
  first_name?: string
  last_name?: string
  gamemaster?: boolean
  admin?: boolean
  image_url: string
  onboarding_progress?: OnboardingProgress
  discord_id?: string
  character_ids?: string[]
  characters?: Character[]
}

export interface Site extends BaseEntity {
  id: string
  name: string
  description?: string
  faction?: Faction | null
  faction_id: string | null
  characters: Character[]
  image_url: string
  created_at: string
  updated_at: string
}

export interface Juncture extends BaseEntity {
  id: string
  name: string
  description?: string
  faction?: Faction | null
  faction_id: string | null
  characters: Character[]
  active: boolean
  image_url: string
  created_at: string
  updated_at: string
}

export interface Effect {
  id: string
  name: string
  description: string
  severity: Severity
  start_sequence: number
  end_sequence: number
  start_shot: number
  end_shot: number
}

export interface CharacterEffect {
  id: string
  name: string
  description?: string
  character_id: string
  vehicle_id: string
  severity: Severity
  change?: string
  action_value?: string
  shot_id: string
}

export interface CharacterEffects {
  [key: string]: CharacterEffect[]
}

export interface Vehicle extends BaseEntity {
  id: string
  name: string
  active: boolean
  impairments: number
  color: string
  action_values: ActionValues | VehicleActionValues
  description: DescriptionValues
  faction_id: string | null
  faction: Faction
  schticks: Schtick[]
  advancements: Advancement[]
  sites: Site[]
  weapons: Weapon[]
  skills: SkillValues
  user?: User
  user_id: string
  created_at: string
  updated_at: string
  new?: boolean
  category: CharacterCategory
  count: number
  shot_id: string
  driver?: Character
  driver_id?: string
  location?: string
  image_url: string
  task: boolean
  notion_page_id: string | null
  driving?: Vehicle
  was_rammed_or_damaged?: boolean
  is_defeated_in_chase?: boolean
  defeat_type?: "crashed" | "boxed_in" | null
  defeat_threshold?: number
  wealth: string
  juncture_id: string | null
  juncture: Juncture | null
  effects?: CharacterEffect[]
  chase_relationships?: ChaseRelationship[]
}

export interface ChaseRelationship extends BaseEntity {
  id: string
  pursuer_id: string
  evader_id: string
  pursuer?: Vehicle
  evader?: Vehicle
  fight_id: string
  fight?: Fight
  position: "near" | "far"
  active: boolean
  is_pursuer?: boolean
  created_at: string
  updated_at: string
}

export interface Person extends BaseEntity {
  id: string
  name: string
  active: boolean
  extending?: boolean
  impairments: number
  color: string
  faction_id: string | null
  faction: Faction
  action_values: ActionValues
  description: DescriptionValues
  schticks: Schtick[]
  schtick_ids?: string[]
  skills: SkillValues
  advancements: Advancement[]
  advancement_ids?: string[]
  sites: Site[]
  site_ids?: string[]
  weapons: Weapon[]
  weapon_ids?: string[]
  party_ids?: string[]
  user?: User
  user_id: string
  created_at: string
  updated_at: string
  new?: boolean
  category: CharacterCategory
  count: number
  driver?: Character
  location?: string
  image_url: string
  task: boolean
  status?: string[]
  notion_page_id: string | null
  driving?: Vehicle
  wealth: string
  juncture_id: string | null
  juncture: Juncture | null
  is_template?: boolean
  shot_id?: string
  effects?: CharacterEffect[]
}

export interface Advancement {
  id: string
  character_id: string
  description: string
  created_at: string
  updated_at: string
}

// Entity union type - all entity types that can be displayed with avatars
export type Entity =
  | Campaign
  | Character
  | Fight
  | Site
  | Vehicle
  | Faction
  | Juncture
  | Party
  | Weapon
  | Schtick
  | User
  | Person
