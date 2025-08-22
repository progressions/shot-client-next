import type { Person } from "@/types"
import { defaultCharacter } from "@/types/defaults"
import { derringer, ak47 } from "./Weapons"

export const brick: Person = {
  ...defaultCharacter,
  name: "Brick Manly",
  id: "brick",
  action_values: {
    ...defaultCharacter.action_values,
    Type: "PC",
    Archetype: "Everyday Hero",
    MainAttack: "Martial Arts",
    SecondaryAttack: null,
    "Martial Arts": 14,
    Defense: 13,
    Toughness: 7,
    FortuneType: "Fortune",
    "Max Fortune": 5,
    Fortune: 5,
    Speed: 5
  }
}

export const carolina: Person = {
  ...defaultCharacter,
  name: "Carolina Kominsky",
  id: "carolina",
  action_values: {
    ...defaultCharacter.action_values,
    Type: "PC",
    Archetype: "Maverick Cop",
    MainAttack: "Guns",
    SecondaryAttack: "Martial Arts",
    Guns: 14,
    "Martial Arts": 12,
    Defense: 13,
    Speed: 7,
    Fortune: 7
  },
  skills: {
    ...defaultCharacter.skills,
    Driving: 13
  },
  weapons: [derringer]
}

export const shing: Person = {
  ...defaultCharacter,
  name: "Ugly Shing",
  id: "shing",
  action_values: {
    ...defaultCharacter.action_values,
    Type: "Boss",
    MainAttack: "Guns",
    SecondaryAttack: null,
    Guns: 17,
    Defense: 14,
    Damage: 9,
    Toughness: 7
  },
  skills: {
    Driving: 15
  },
  weapons: [ak47]
}

export const huanKen: Person = {
  ...defaultCharacter,
  name: "Huan Ken",
  id: "huanKen",
  action_values: {
    ...defaultCharacter.action_values,
    Type: "Uber-Boss",
    MainAttack: "Sorcery",
    SecondaryAttack: null,
    Sorcery: 19,
    Defense: 17,
    Damage: 12,
    Toughness: 8
  },
}

export const hitman: Person = {
  ...defaultCharacter,
  name: "Hitman",
  id: "hitman",
  action_values: {
    ...defaultCharacter.action_values,
    Type: "Featured Foe",
    MainAttack: "Guns",
    SecondaryAttack: null,
    Guns: 14,
    Defense: 13,
    Toughness: 7,
    Damage: 9,
  },
}

export const zombies: Person = {
  ...defaultCharacter,
  name: "Zombies",
  id: "zombies",
  count: 15,
  action_values: {
    ...defaultCharacter.action_values,
    Type: "Mook",
    MainAttack: "Creature",
    SecondaryAttack: null,
    Creature: 8,
    Defense: 13,
    Damage: 7
  }
}