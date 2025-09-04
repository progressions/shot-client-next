import type { Character } from "@/types/types"
import { CharacterTypes } from "@/types/types"
import { defaultCharacter } from "@/types/defaults"
import { derringer, ak47 } from "@/__tests__/factories/Weapons"

export const brick: Character = {
  ...defaultCharacter,
  name: "Brick Manly",
  id: "brick",
  action_values: {
    ...defaultCharacter.action_values,
    Type: CharacterTypes.PC,
    Archetype: "Everyday Hero",
    MainAttack: "Martial Arts",
    SecondaryAttack: null,
    "Martial Arts": 14,
    Defense: 13,
    Toughness: 7,
    FortuneType: "Fortune",
    MaxFortune: 5,
    Fortune: 5,
    Speed: 5,
  },
}

export const carolina: Character = {
  ...defaultCharacter,
  name: "Carolina Kominsky",
  id: "carolina",
  action_values: {
    ...defaultCharacter.action_values,
    Type: CharacterTypes.PC,
    Archetype: "Maverick Cop",
    MainAttack: "Guns",
    SecondaryAttack: "Martial Arts",
    Guns: 14,
    "Martial Arts": 12,
    Defense: 13,
    Speed: 7,
    Fortune: 7,
    "Max Fortune": 7,
    Toughness: 8,
  },
  skills: {
    ...defaultCharacter.skills,
    Driving: 13,
  },
  weapons: [derringer],
}

export const shing: Character = {
  ...defaultCharacter,
  name: "Ugly Shing",
  id: "shing",
  action_values: {
    ...defaultCharacter.action_values,
    Type: CharacterTypes.Boss,
    MainAttack: "Guns",
    SecondaryAttack: null,
    Guns: 17,
    Defense: 14,
    Damage: 9,
    Toughness: 7,
  },
  skills: {
    Driving: 15,
  },
  weapons: [ak47],
}

export const huanKen: Character = {
  ...defaultCharacter,
  name: "Huan Ken",
  id: "huanKen",
  action_values: {
    ...defaultCharacter.action_values,
    Type: CharacterTypes.UberBoss,
    MainAttack: "Sorcery",
    SecondaryAttack: null,
    Sorcery: 19,
    Defense: 17,
    Damage: 12,
    Toughness: 8,
  },
}

export const hitman: Character = {
  ...defaultCharacter,
  name: "Hitman",
  id: "hitman",
  action_values: {
    ...defaultCharacter.action_values,
    Type: CharacterTypes.FeaturedFoe,
    MainAttack: "Guns",
    SecondaryAttack: null,
    Guns: 14,
    Defense: 13,
    Toughness: 7,
    Damage: 9,
  },
}

export const zombies: Character = {
  ...defaultCharacter,
  name: "Zombies",
  id: "zombies",
  count: 15,
  action_values: {
    ...defaultCharacter.action_values,
    Type: CharacterTypes.Mook,
    MainAttack: "Creature",
    SecondaryAttack: null,
    Creature: 8,
    Defense: 13,
    Damage: 7,
  },
}
