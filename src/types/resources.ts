import type {
  BaseEntity,
  Invitation,
  FightEvent,
  Severity,
  SchtickCategory,
  SchtickPath,
} from "./ui"
import type { AiProvider } from "./ai-credentials"
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
  gamemaster_id?: string
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
  // Batch image generation fields
  batch_image_status?: string | null
  batch_images_total?: number
  batch_images_completed?: number
  is_batch_images_in_progress?: boolean
  // Provider-agnostic AI credit exhaustion tracking
  ai_credits_exhausted_at?: string | null
  ai_credits_exhausted_provider?: AiProvider | null
  is_ai_credits_exhausted?: boolean
  // Grok API credit exhaustion tracking (legacy - for backward compatibility)
  grok_credits_exhausted_at?: string | null
  is_grok_credits_exhausted?: boolean
  // AI generation toggle
  ai_generation_enabled?: boolean
  // AI provider configuration
  ai_provider?: AiProvider | null
  // Notion Integration
  notion_connected?: boolean
  notion_workspace_name?: string
  notion_workspace_icon?: string
  notion_database_ids?: Record<string, string>
  notion_oauth_available?: boolean
}

/**
 * Helper function to determine if a campaign is currently seeding.
 * Checks both the is_seeding flag and seeding_status to handle edge cases.
 */
export function isCampaignSeeding(
  campaign: Campaign | null | undefined
): boolean {
  if (!campaign) return false
  return (
    campaign.is_seeding === true ||
    (campaign.seeding_status != null && campaign.seeding_status !== "complete")
  )
}

/**
 * Helper function to determine if batch image generation is currently in progress.
 * Checks both the is_batch_images_in_progress flag and batch_image_status to handle edge cases.
 */
export function isBatchImageGenerating(
  campaign: Campaign | null | undefined
): boolean {
  if (!campaign) return false
  return (
    campaign.is_batch_images_in_progress === true ||
    (campaign.batch_image_status != null &&
      campaign.batch_image_status !== "complete")
  )
}

/**
 * Helper function to determine if any AI provider's credits are exhausted.
 * Relies on the server-computed flag to maintain single source of truth.
 *
 * Only returns true if:
 * 1. Credits are actually exhausted (is_ai_credits_exhausted === true)
 * 2. The exhausted provider matches the current provider
 *
 * If the user has switched to a different provider than the one that exhausted,
 * this returns false since that provider's credit exhaustion doesn't affect them.
 */
export function isAiCreditsExhausted(
  campaign: Campaign | null | undefined
): boolean {
  if (!campaign) return false
  if (campaign.is_ai_credits_exhausted !== true) return false

  // If using a different provider than the exhausted one, credit exhaustion doesn't apply
  const currentProvider = campaign.ai_provider
  const exhaustedProvider = campaign.ai_credits_exhausted_provider

  // If we know both providers and they're different, don't show the alert
  if (
    currentProvider &&
    exhaustedProvider &&
    currentProvider !== exhaustedProvider
  ) {
    return false
  }

  return true
}

/**
 * Helper function to determine if Grok API credits are exhausted.
 * LEGACY - kept for backward compatibility. Use isAiCreditsExhausted instead.
 * Relies on the server-computed flag to maintain single source of truth.
 *
 * Only returns true if:
 * 1. Credits are actually exhausted (is_grok_credits_exhausted === true)
 * 2. The campaign is using Grok as the AI provider (ai_provider is null/undefined or "grok")
 *
 * If the user has switched to a different provider (openai, gemini),
 * this returns false since Grok credit exhaustion doesn't affect them.
 */
export function isGrokCreditsExhausted(
  campaign: Campaign | null | undefined
): boolean {
  if (!campaign) return false
  if (campaign.is_grok_credits_exhausted !== true) return false

  // If using a non-Grok provider, credit exhaustion doesn't apply
  const provider = campaign.ai_provider
  if (provider && provider !== "grok") return false

  return true
}

/**
 * Helper function to determine if AI generation is enabled for a campaign.
 * Defaults to true if the field is not set (backwards compatibility).
 */
export function isAiGenerationEnabled(
  campaign: Campaign | null | undefined
): boolean {
  if (!campaign) return false
  // Default to true for backwards compatibility
  return campaign.ai_generation_enabled !== false
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

// Party composition role types
export type PartyRole = "boss" | "featured_foe" | "mook" | "ally"

// Party composition slot (membership with role)
export interface PartySlot {
  id: string
  role: PartyRole
  character_id?: string | null
  vehicle_id?: string | null
  character?: Character | null
  vehicle?: Vehicle | null
  default_mook_count?: number | null
  position: number
}

// Party template for preset compositions
export interface PartyTemplate {
  key: string
  name: string
  description: string
  slots: PartyTemplateSlot[]
}

export interface PartyTemplateSlot {
  role: PartyRole
  label: string
  default_mook_count?: number | null
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
  // Party composition
  slots?: PartySlot[]
  has_composition?: boolean
  notion_page_id?: string | null
  last_synced_to_notion_at?: string | null
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
  notion_page_id?: string | null
  last_synced_to_notion_at?: string | null
}

export interface Schtick extends BaseEntity {
  id: string
  name: string
  description: string
  campaign_id: string
  category: SchtickCategory
  path: SchtickPath
  prerequisite_id?: string | null
  prerequisite?: {
    id: string
    name?: string
    category?: string
  } | null
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
  user_id?: string | null
  user?: User | null
  // Solo play fields
  solo_mode?: boolean
  solo_player_character_ids?: string[]
  solo_behavior_type?: "simple" | "ai"
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
  character_ids: string[]
  image_url: string
  created_at: string
  updated_at: string
  notion_page_id?: string | null
  last_synced_to_notion_at?: string | null
}

export interface Juncture extends BaseEntity {
  id: string
  name: string
  description?: string
  faction?: Faction | null
  faction_id: string | null
  characters: Character[]
  character_ids: string[]
  active: boolean
  image_url: string
  created_at: string
  updated_at: string
  notion_page_id?: string | null
  last_synced_to_notion_at?: string | null
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
  equipped_weapon_id?: string | null
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

// Notion Sync Log - records of entity syncs to Notion
export interface NotionSyncLog {
  id: string
  status: "success" | "error"
  payload: Record<string, unknown> | null
  response: Record<string, unknown> | null
  error_message: string | null
  entity_type: "character" | "site" | "party" | "faction" | "juncture"
  entity_id: string
  character_id?: string | null
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
