import type {
  Faction,
  Person,
  Vehicle,
  Fight,
  User,
  Effect,
  Toast,
  Campaign,
  CharacterEffect,
  Schtick,
  Advancement,
  Juncture,
  Site,
  Party,
  Weapon,
  PaginationMeta,
  Location,
  Swerve
} from "@/types/types"

export const defaultFaction:Faction = {
  id: "",
  name: "",
  description: "",
  characters: [],
  vehicles: [],
  active: true,
  image_url: null,
  created_at: "",
  updated_at: ""
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
  actors: [],
  characters: [],
  shot_order: [],
  character_effects: {},
  vehicle_effects: {},
  image_url: null,
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
  color: "",
  image_url: "",
  created_at: "",
  updated_at: "",
}

export const defaultAdvancement:Advancement = {
  description: ""
}

export const defaultJuncture:Juncture = {
  name: "",
  description: "",
  faction: null,
  faction_id: null,
  active: true,
  image_url: null,
  characters: [],
  created_at: "",
  updated_at: ""
}

export const defaultSite:Site = {
  name: "",
  description: "",
  faction: null,
  faction_id: null,
  secret: false,
  image_url: null,
  characters: [],
  created_at: "",
  updated_at: ""
}

export const defaultParty:Party = {
  name: "",
  description: "",
  faction: null,
  faction_id: null,
  characters: [],
  vehicles: [],
  secret: false,
  image_url: null,
  created_at: "",
  updated_at: ""
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
  image_url: "",
  created_at: "",
  updated_at: "",
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


