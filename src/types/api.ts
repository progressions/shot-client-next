import type {
  Campaign,
  Character,
  User,
  Fight,
  Site,
  Vehicle,
  Faction,
  Juncture,
  Party,
  Weapon,
  Schtick,
  CharacterJson,
} from "@/types/resources"

/**
 * API Response Types
 * Types related to API communication, error handling, and server responses
 */

export interface ServerErrorResponse {
  errors: Partial<Record<string, string[]>>
}

export interface ApiErrorResponse {
  error?: string
  errors?: string[]
  message?: string
}

export interface HttpError extends Error {
  response?: {
    status: number
    data: ApiErrorResponse
  }
}

export interface ConfirmationResponse {
  message: string
  user?: User
  token?: string
  campaign_id?: string
  error?: string
  errors?: string[]
}

/**
 * WebSocket and Cable Types
 * Types for real-time communication via ActionCable
 */

export interface CampaignCableData {
  fight: Fight | null
  encounter: Fight | null
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
  // Media library reload signal
  images?: string | null
  // Notion sync log reload signal
  notion_sync_logs?: string | null
  character_id?: string
  // Seeding status fields for real-time updates
  seeding_status?: string | null
  campaign_id?: string
  images_total?: number
  images_completed?: number
}

export interface CableData {
  status: "preview_ready" | "character_ready" | "error"
  json?: CharacterJson
  character?: Character
  error?: string
}

export interface FightChannelMessage {
  fight?: "updated" | Fight
  users?: Viewer[]
}

export interface Viewer {
  id: string
  first_name?: string
  last_name?: string
  name: string
  image_url?: string | null
}

/**
 * Authentication and Session Types
 */

export interface SessionData {
  authorization: object
  user?: User
}

/**
 * External Service Types
 */

export interface NotionPage {
  id: string
  properties?: {
    Name?: {
      title?: Array<{
        plain_text?: string
      }>
    }
  }
}

/**
 * URL and Query Parameter Types
 */

export interface ParametersType {
  [key: string]: string
  id: string
}

export interface QueryType {
  [key: string]: string | undefined
  confirmation_token?: string
  reset_password_token?: string
}
