/**
 * Factory functions for creating mock data in tests
 * These provide flexible mock creation with sensible defaults
 */

import type {
  Character,
  Vehicle,
  Fight,
  Weapon,
  Schtick,
  User,
  Campaign,
  Party,
  Faction,
} from "@/types/types"
import {
  CharacterTypes,
  defaultCharacter,
  defaultVehicle,
  defaultFight,
  defaultWeapon,
  defaultSchtick,
  defaultUser,
  defaultCampaign,
  defaultParty,
  defaultFaction,
} from "@/types/types"

/**
 * Creates a mock character with optional overrides
 */
export const createMockCharacter = (
  overrides: Partial<Character> = {}
): Character => {
  return {
    ...defaultCharacter,
    id: "test-character-1",
    name: "Test Character",
    active: true,
    color: "#3f51b5",
    action_values: {
      ...defaultCharacter.action_values,
      Type: CharacterTypes.PC,
      MainAttack: "Martial Arts",
      "Martial Arts": 12,
      Defense: 12,
      Toughness: 6,
      Speed: 5,
      ...overrides.action_values,
    },
    ...overrides,
  }
}

/**
 * Creates a mock vehicle with optional overrides
 */
export const createMockVehicle = (
  overrides: Partial<Vehicle> = {}
): Vehicle => {
  return {
    ...defaultVehicle,
    id: "test-vehicle-1",
    name: "Test Vehicle",
    active: true,
    action_values: {
      ...defaultVehicle.action_values,
      Type: CharacterTypes.PC,
      Acceleration: 8,
      Handling: 9,
      Squeal: 15,
      Frame: 10,
      Crunch: 7,
      ...overrides.action_values,
    },
    ...overrides,
  }
}

/**
 * Creates a mock fight with optional overrides
 */
export const createMockFight = (overrides: Partial<Fight> = {}): Fight => {
  return {
    ...defaultFight,
    id: "test-fight-1",
    name: "Test Fight",
    sequence: 1,
    active: false,
    actors: [],
    ...overrides,
  }
}

/**
 * Creates a mock weapon with optional overrides
 */
export const createMockWeapon = (overrides: Partial<Weapon> = {}): Weapon => {
  return {
    ...defaultWeapon,
    id: "test-weapon-1",
    name: "Test Weapon",
    damage: 10,
    concealment: 3,
    reload_value: 0,
    category: "Guns",
    juncture: "Contemporary",
    ...overrides,
  }
}

/**
 * Creates a mock schtick with optional overrides
 */
export const createMockSchtick = (
  overrides: Partial<Schtick> = {}
): Schtick => {
  return {
    ...defaultSchtick,
    id: "test-schtick-1",
    name: "Test Schtick",
    category: "gun",
    description: "A test schtick",
    prerequisite_id: null,
    prerequisite: null,
    ...overrides,
  }
}

/**
 * Creates a mock user with optional overrides
 */
export const createMockUser = (overrides: Partial<User> = {}): User => {
  return {
    ...defaultUser,
    id: "test-user-1",
    name: "Test User",
    email: "test@example.com",
    gamemaster: false,
    admin: false,
    ...overrides,
  }
}

/**
 * Creates a mock campaign with optional overrides
 */
export const createMockCampaign = (
  overrides: Partial<Campaign> = {}
): Campaign => {
  return {
    ...defaultCampaign,
    id: "test-campaign-1",
    name: "Test Campaign",
    description: "A test campaign",
    ...overrides,
  }
}

/**
 * Creates a mock party with optional overrides
 */
export const createMockParty = (overrides: Partial<Party> = {}): Party => {
  return {
    ...defaultParty,
    id: "test-party-1",
    name: "Test Party",
    description: "A test party",
    characters: [],
    vehicles: [],
    ...overrides,
  }
}

/**
 * Creates a mock faction with optional overrides
 */
export const createMockFaction = (
  overrides: Partial<Faction> = {}
): Faction => {
  return {
    ...defaultFaction,
    id: "test-faction-1",
    name: "Test Faction",
    description: "A test faction",
    active: true,
    ...overrides,
  }
}
