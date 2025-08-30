import type { AxiosResponse } from "axios"
import { collectionNames } from "@/lib/maps"

// Type for a record from the API
interface ApiRecord {
  id: number | string
  name?: string
  title?: string
  [key: string]: unknown
}

// Type for the client instance from useClient
// Using a minimal interface to avoid circular dependencies
interface ClientInstance {
  getCharacters: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getVehicles: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getFights: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getWeapons: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getSchticks: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getSites: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getParties: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getFactions: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getJunctures: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getUsers: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  getCampaigns: (filters: Record<string, unknown>) => Promise<AxiosResponse<ApiResponse>>
  [key: string]: unknown
}

// Type for API response with data array
interface ApiResponse<T = ApiRecord> {
  data?: T[]
  [key: string]: unknown
}

// Mapping of model names to their corresponding client methods
// These explicit references ensure methods won't be removed during tree-shaking
export const modelApiMethods: Record<
  string,
  (
    client: ClientInstance,
    filters: Record<string, unknown>
  ) => Promise<AxiosResponse<ApiResponse>>
> = {
  // Characters (handle both cases)
  character: (client, filters) => client.getCharacters(filters),
  characters: (client, filters) => client.getCharacters(filters),
  Character: (client, filters) => client.getCharacters(filters),
  Characters: (client, filters) => client.getCharacters(filters),

  // Vehicles (handle both cases)
  vehicle: (client, filters) => client.getVehicles(filters),
  vehicles: (client, filters) => client.getVehicles(filters),
  Vehicle: (client, filters) => client.getVehicles(filters),
  Vehicles: (client, filters) => client.getVehicles(filters),

  // Fights (handle both cases)
  fight: (client, filters) => client.getFights(filters),
  fights: (client, filters) => client.getFights(filters),
  Fight: (client, filters) => client.getFights(filters),
  Fights: (client, filters) => client.getFights(filters),

  // Weapons (handle both cases)
  weapon: (client, filters) => client.getWeapons(filters),
  weapons: (client, filters) => client.getWeapons(filters),
  Weapon: (client, filters) => client.getWeapons(filters),
  Weapons: (client, filters) => client.getWeapons(filters),

  // Schticks (handle both cases)
  schtick: (client, filters) => client.getSchticks(filters),
  schticks: (client, filters) => client.getSchticks(filters),
  Schtick: (client, filters) => client.getSchticks(filters),
  Schticks: (client, filters) => client.getSchticks(filters),

  // Sites (handle both cases)
  site: (client, filters) => client.getSites(filters),
  sites: (client, filters) => client.getSites(filters),
  Site: (client, filters) => client.getSites(filters),
  Sites: (client, filters) => client.getSites(filters),

  // Parties (handle both cases - special pluralization)
  party: (client, filters) => client.getParties(filters),
  parties: (client, filters) => client.getParties(filters),
  Party: (client, filters) => client.getParties(filters),
  Parties: (client, filters) => client.getParties(filters),

  // Factions (handle both cases)
  faction: (client, filters) => client.getFactions(filters),
  factions: (client, filters) => client.getFactions(filters),
  Faction: (client, filters) => client.getFactions(filters),
  Factions: (client, filters) => client.getFactions(filters),

  // Junctures (handle both cases)
  juncture: (client, filters) => client.getJunctures(filters),
  junctures: (client, filters) => client.getJunctures(filters),
  Juncture: (client, filters) => client.getJunctures(filters),
  Junctures: (client, filters) => client.getJunctures(filters),

  // Users (handle both cases)
  user: (client, filters) => client.getUsers(filters),
  users: (client, filters) => client.getUsers(filters),
  User: (client, filters) => client.getUsers(filters),
  Users: (client, filters) => client.getUsers(filters),

  // Campaigns (handle both cases)
  campaign: (client, filters) => client.getCampaigns(filters),
  campaigns: (client, filters) => client.getCampaigns(filters),
  Campaign: (client, filters) => client.getCampaigns(filters),
  Campaigns: (client, filters) => client.getCampaigns(filters),
}

// Transform generic filters to API-specific parameters
// This handles cases like character_id, campaign_id, etc.
export function transformFiltersForModel(
  model: string,
  filters: Record<string, unknown>
): Record<string, unknown> {
  const transformed = { ...filters }

  // Remove any empty string values
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === "") {
      delete transformed[key]
    }
  })

  // Model-specific transformations can be added here
  // For example, if certain models need special parameter names

  return transformed
}

// Get the appropriate API method for a model
export function getApiMethodForModel(
  model: string
):
  | ((
      client: ClientInstance,
      filters: Record<string, unknown>
    ) => Promise<AxiosResponse<ApiResponse>>)
  | null {
  // Try exact match first (for capitalized versions)
  if (modelApiMethods[model]) {
    return modelApiMethods[model]
  }
  // Fall back to lowercase
  const modelLower = model.toLowerCase()
  return modelApiMethods[modelLower] || null
}

// Ensure all methods are preserved during compilation by explicitly referencing them
// This prevents tree-shaking from removing "unused" methods
export const preservedMethods = Object.values(modelApiMethods)
