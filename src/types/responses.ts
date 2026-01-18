import type {
  Adventure,
  Character,
  User,
  Campaign,
  Vehicle,
  Party,
  Faction,
  Site,
  Schtick,
  Weapon,
  Juncture,
  Fight,
  NotionSyncLog,
} from "./resources"
import type {
  SchtickPath,
  SchtickCategory,
  WeaponCategory,
  Archetype,
  VehicleArchetype,
} from "./ui"

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

export interface AdventuresResponse {
  adventures: Adventure[]
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
  seasons: number[]
  meta: PaginationMeta
}

export interface CharactersResponse {
  characters: Character[]
  meta: PaginationMeta
  factions: Faction[]
  archetypes: Archetype[]
}

export interface NotionSyncLogsMeta {
  current_page: number
  per_page: number
  total_count: number
  total_pages: number
}

export interface NotionSyncLogsResponse {
  notion_sync_logs: NotionSyncLog[]
  meta: NotionSyncLogsMeta
}

export interface VehiclesResponse {
  vehicles: Vehicle[]
  meta: PaginationMeta
}

export interface VehicleArchetypesResponse {
  archetypes: VehicleArchetype[]
}

export interface CharactersAndVehiclesResponse {
  characters: Character[]
  meta: PaginationMeta
  factions: Faction[]
}

export type BackendErrorResponse = {
  name?: string[]
  error?: string
  errors?: Record<string, string[]>
}

export interface UsersResponse {
  users: User[]
  meta: PaginationMeta
}

export interface CampaignsResponse {
  campaigns: Campaign[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  current_page: number
  next_page: number | null
  prev_page: number | null
  total_pages: number
  total_count: number
}

// Search result item returned from the search endpoint
export interface SearchResultItem {
  id: string
  name: string
  image_url: string | null
  entity_class: string
  description: string | null
}

// Search response grouped by entity type
export interface SearchResponse {
  results: {
    characters?: SearchResultItem[]
    vehicles?: SearchResultItem[]
    fights?: SearchResultItem[]
    sites?: SearchResultItem[]
    parties?: SearchResultItem[]
    factions?: SearchResultItem[]
    schticks?: SearchResultItem[]
    weapons?: SearchResultItem[]
    junctures?: SearchResultItem[]
    adventures?: SearchResultItem[]
  }
}
