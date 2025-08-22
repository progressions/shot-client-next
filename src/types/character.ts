import { Vehicle, Archetype, Person } from "@/types"

export type CharacterType =
  | "PC"
  | "Ally"
  | "Mook"
  | "Featured Foe"
  | "Boss"
  | "Uber-Boss"

export enum CharacterTypes {
  PC = "PC",
  Ally = "Ally",
  Mook = "Mook",
  FeaturedFoe = "Featured Foe",
  Boss = "Boss",
  UberBoss = "Uber-Boss",
}

export enum DescriptionKeys {
  Nicknames = "Nicknames",
  Age = "Age",
  Height = "Height",
  Weight = "Weight",
  HairColor = "Hair Color",
  EyeColor = "Eye Color",
  StyleOfDress = "Style of Dress",
  Appearance = "Appearance",
  Background = "Background",
  MelodramaticHook = "Melodramatic Hook",
}

export type DescriptionValues = {
  [key in DescriptionKeys]: string
}

export interface AVs {
  [key: string]: string | number | null | undefined | boolean
}

export interface ActionValues {
  [key: string]: string | number | null | undefined | boolean
  Guns?: number
  "Martial Arts"?: number
  Sorcery?: number
  Scroungetech?: number
  Genome?: number
  Creature?: number
  Defense?: number
  Toughness?: number
  Speed?: number
  Fortune?: number
  "Max Fortune"?: number
  FortuneType?: string
  MainAttack?: string
  SecondaryAttack?: string | null
  Wounds: number
  Type?: CharacterType
  Damage?: number
  Vehicle?: boolean
  "Marks of Death": number
  Archetype: Archetype
}

export type SkillValue = [string, number] | [string, undefined]

export interface SkillValues {
  [key: string]: number | undefined
  Deceit?: number
  Detective?: number
  Driving?: number
  "Fix-It"?: number
  Gambling?: number
  Intimidation?: number
  Intrusion?: number
  Leadership?: number
  Medicine?: number
  Police?: number
  Sabotage?: number
  Seduction?: number
  Constitution?: number
  Defense?: number
  Melodrama?: number
  Will?: number
  Notice?: number
  Strength?: number
}

export type Character = Vehicle | Person
export type CharacterCategory = "character" | "vehicle"
