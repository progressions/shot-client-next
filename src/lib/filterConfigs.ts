import type { FilterConfig } from "@/types"

export const filterConfigs: Record<string, FilterConfig> = {
  Character: {
    entityName: "Character",
    fields: [
      {
        name: "character_type",
        type: "static",
        allowNone: false,
        staticOptions: [
          "Ally",
          "PC",
          "Mook",
          "Featured Foe",
          "Boss",
          "Uber-Boss",
        ],
        displayName: "Type",
      },
      { name: "faction", type: "entity" },
      { name: "archetype", type: "string" },
      { name: "character", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: {
      faction: "factions",
      archetype: "archetypes",
      character: "characters",
    },
  },
  Schtick: {
    entityName: "Schtick",
    fields: [
      { name: "category", type: "string" },
      { name: "path", type: "string" },
      { name: "schtick", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: {
      category: "categories",
      path: "paths",
      schtick: "schticks",
    },
  },
  Weapon: {
    entityName: "Weapon",
    fields: [
      { name: "juncture", type: "string" },
      { name: "category", type: "string" },
      { name: "weapon", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: {
      category: "categories",
      juncture: "junctures",
      weapon: "weapons",
    },
  },
  Vehicle: {
    entityName: "Vehicle",
    fields: [
      {
        name: "type",
        type: "static",
        allowNone: false,
        staticOptions: [
          "Ally",
          "PC",
          "Mook",
          "Featured Foe",
          "Boss",
          "Uber-Boss",
        ],
      },
      { name: "faction", type: "entity" },
      { name: "archetype", type: "string" },
      { name: "vehicle", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: {
      type: "types",
      archetype: "archetypes",
      faction: "factions",
      vehicle: "vehicles",
    },
  },
  Fight: {
    entityName: "Fight",
    fields: [
      { name: "season", type: "string" },
      {
        name: "status",
        type: "static",
        staticOptions: ["Started", "Unstarted", "Ended"],
        defaultValue: "Unstarted",
      },
      { name: "fight", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: { season: "seasons", status: "status", fight: "fights" },
  },
  Party: {
    entityName: "Party",
    fields: [
      { name: "faction", type: "entity" },
      { name: "party", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: { faction: "factions", party: "parties" },
  },
  Juncture: {
    entityName: "Juncture",
    fields: [
      { name: "faction", type: "entity" },
      { name: "juncture", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: { faction: "factions", juncture: "junctures" },
  },
  User: {
    entityName: "User",
    fields: [
      { name: "user", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: { user: "users" },
  },
  Site: {
    entityName: "Site",
    fields: [
      { name: "faction", type: "entity" },
      { name: "site", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: { faction: "factions", site: "sites" },
  },
  Campaign: {
    entityName: "Campaign",
    fields: [
      { name: "campaign", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: { campaign: "campaigns" },
  },
  Faction: {
    entityName: "Faction",
    fields: [
      { name: "faction", type: "entity", allowNone: false },
      { name: "search", type: "search" },
    ],
    responseKeys: { faction: "factions" },
  },
}
