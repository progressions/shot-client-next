import type {
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
  SchtickPath,
  SchtickCategory,
  WeaponCategory,
  Fight,
  Archetype,
} from "@/types"

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
