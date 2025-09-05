import { CharacterTypes, Faction, Vehicle, Character } from "@/types"
import { parseToNumber } from "@/lib/parseToNumber"
import Dice from "@/services/DiceService"

// Define the type for the wound thresholds
type WoundThresholds = {
  low: number
  high: number
  serious: number
}

// Create the woundThresholds object with optional keys for Mook
export const woundThresholds: {
  [key in CharacterTypes]?: WoundThresholds
} = {
  [CharacterTypes.UberBoss]: { low: 40, high: 45, serious: 50 },
  [CharacterTypes.Boss]: { low: 40, high: 45, serious: 50 },
  [CharacterTypes.PC]: { low: 25, high: 30, serious: 35 },
  [CharacterTypes.Ally]: { low: 25, high: 30, serious: 35 },
  [CharacterTypes.FeaturedFoe]: { low: 25, high: 30, serious: 35 },
  // Mook key is optional and can be omitted if not needed
}

const SharedService = {
  name: function (character: Character | Vehicle): string {
    return character.name
  },

  type: function (character: Character | Vehicle): CharacterTypes {
    return this.otherActionValue(character, "Type") as CharacterTypes
  },

  archetype: function (character: Character | Vehicle): CharacterTypes {
    return this.otherActionValue(character, "Archetype") as string
  },

  hidden: function (character: Character | Vehicle): boolean {
    return (
      character.current_shot === undefined || character.current_shot === null
    )
  },

  isCharacter: function (character: Character | Vehicle): boolean {
    return character.category === "character"
  },

  isVehicle: function (character: Character | Vehicle): boolean {
    return character.entity_class === "Vehicle"
  },

  isFriendly: function (character: Character | Vehicle): boolean {
    return this.isType(character, [CharacterTypes.PC, CharacterTypes.Ally])
  },

  isUnfriendly: function (character: Character | Vehicle): boolean {
    return !this.isFriendly(character)
  },

  isMook: function (character: Character | Vehicle): boolean {
    return this.isType(character, CharacterTypes.Mook)
  },

  isPC: function (character: Character | Vehicle): boolean {
    return this.isType(character, CharacterTypes.PC)
  },

  isAlly: function (character: Character | Vehicle): boolean {
    return this.isType(character, CharacterTypes.Ally)
  },

  isBoss: function (character: Character | Vehicle): boolean {
    return this.isType(character, CharacterTypes.Boss)
  },

  isFeaturedFoe: function (character: Character | Vehicle): boolean {
    return this.isType(character, CharacterTypes.FeaturedFoe)
  },

  isUberBoss: function (character: Character | Vehicle): boolean {
    return this.isType(character, CharacterTypes.UberBoss)
  },

  isTask: function (character: Character | Vehicle): boolean {
    return !!character.task
  },

  isType: function (
    character: Character | Vehicle,
    type: string | string[]
  ): boolean {
    if (Array.isArray(type)) {
      return type.includes(this.type(character))
    }

    return this.type(character) === type
  },

  actionValues: function (
    character: Character | Vehicle
  ): Record<string, number> {
    const actionValues: Record<string, number> = {}

    if (!character?.action_values) return actionValues

    for (const key in character.action_values) {
      if (character.action_values.hasOwnProperty(key)) {
        actionValues[key] = this.actionValue(character, key)
      }
    }

    return actionValues
  },

  // Adjusted for Impairment
  // Attacks, Defense and skill checks
  actionValue: function (character: Character | Vehicle, key: string): number {
    const value = this.rawActionValue(character, key)
    return Math.max(0, value - this.impairments(character))
  },

  // Unadjusted for Impairment
  rawActionValue: function (
    character: Character | Vehicle,
    key: string
  ): number {
    if (!character?.action_values) return 0
    return (character.action_values[key] as number) || 0
  },

  // Use when fetching action values other than numbers.
  otherActionValue: function (
    character: Character | Vehicle,
    key: string
  ): string {
    try {
      if (!character?.action_values) return ""
      return (character.action_values[key] as string) || ""
    } catch (_error) {
      return ""
    }
  },

  descriptionValue: function (
    character: Character | Vehicle,
    key: keyof VehicleDescriptionValues
  ): string {
    return character.description[key] || ""
  },

  faction: function (character: Character | Vehicle): Faction | null {
    return character.faction
  },

  factionName: function (character: Character | Vehicle): string {
    return this.faction(character)?.name || ""
  },

  impairments: function (character: Character | Vehicle): number {
    return character.impairments || 0
  },

  isImpaired: function (character: Character | Vehicle): boolean {
    return character.impairments > 0
  },

  calculateImpairments: function (
    character: Character | Vehicle,
    originalWounds: number,
    newWounds: number
  ): number {
    if (this.isMook(character)) return 0

    const threshold = woundThresholds[this.type(character)]!

    console.log(`[calculateImpairments] ${character.name}:`, {
      type: this.type(character),
      originalWounds,
      newWounds,
      threshold,
      willGainImpairments:
        originalWounds < threshold.low && newWounds >= threshold.low,
    })

    // a Boss and an Uber-Boss gain 1 point of Impairment when their Wounds
    // goes from < 40 to between 40 and 44
    // A PC, Ally, Featured Foe gain 1 point of Impairment when their Wounds
    // go from < 25 to between 25 and 30
    if (
      originalWounds < threshold.low &&
      newWounds >= threshold.low &&
      newWounds < threshold.high
    ) {
      return 1
    }
    // Boss and Uber-Boss gain 1 point of Impairment when their Wounds go from
    // between 40 and 44 to > 45
    // PC, Ally, Featured Foe gain 1 point of Impairment when their Wounds go from
    // between 25 and 29 to >= 30
    if (
      originalWounds >= threshold.low &&
      originalWounds < threshold.high &&
      newWounds >= threshold.high
    ) {
      return 1
    }
    // Boss and Uber-Boss gain 2 points of Impairment when their Wounds go from
    // < 40 to >= 45
    // PC, Ally, Featured Foe gain 2 points of Impairment when their Wounds go from
    // < 25 to >= 30
    if (originalWounds < threshold.low && newWounds >= threshold.high) {
      return 2
    }

    return 0
  },

  seriousPoints: function (
    character: Character | Vehicle,
    value: number
  ): boolean {
    if (this.isMook(character)) return false

    const type = this.type(character)
    const threshold = woundThresholds[type]!
    if (threshold === undefined) return false

    return value >= threshold.serious
  },

  mooks: function (character: Character | Vehicle): number {
    if (!this.isMook(character)) return 0

    return character.count
  },

  woundsLabel: function (character: Character | Vehicle): string {
    if (this.isMook(character)) return "Mooks"

    if (this.isTask(character)) return "Points"

    return "Wounds"
  },

  notionLink: function (character: Character): string | null {
    return character?.notion_page_id
      ? `https://www.notion.so/isaacrpg/${character.notion_page_id.replaceAll("-", "")}`
      : null
  },

  // Update values, makes changes to the character

  addImpairments: function (
    character: Character | Vehicle,
    value: number
  ): Character | Vehicle {
    const impairments = this.impairments(character)
    return this.updateValue(character, "impairments", impairments + value)
  },

  updateActionValue: function (
    character: Character | Vehicle,
    key: string,
    value: number | string
  ): Character | Vehicle {
    return {
      ...character,
      action_values: {
        ...character.action_values,
        [key]: value,
      },
    } as Character | Vehicle
  },

  updateValue: function (
    character: Character | Vehicle,
    key: string,
    value: number | string
  ): Character | Vehicle {
    return {
      ...character,
      [key]: value,
    } as Character | Vehicle
  },

  setInitiative(
    character: Character | Vehicle,
    initiative: number
  ): Character | Vehicle {
    const initiativePenalty = parseToNumber(character.current_shot || 0)
    const init = parseToNumber(initiative)
    const updatedInit = Math.max(0, init + initiativePenalty)

    return this.updateValue(character, "current_shot", updatedInit)
  },

  rollInitiative(
    character: Character | Vehicle,
    roll?: number | null
  ): Character | Vehicle {
    const dieResult = roll || Dice.rollDie()
    const accelerationValue = character?.driving?.id
      ? this.actionValue(character?.driving, "Acceleration")
      : 0
    const initiativeSpeedValue =
      accelerationValue || this.actionValue(character, "Speed")
    const speedRoll = initiativeSpeedValue + dieResult
    const initiativePenalty = parseToNumber(character.current_shot || 0)
    const initiative = Math.max(0, parseToNumber(speedRoll) + initiativePenalty)

    return this.updateValue(character, "current_shot", initiative)
  },

  killMooks: function (
    character: Character | Vehicle,
    mooks: number
  ): Character | Vehicle {
    const originalMooks = this.mooks(character)
    return this.updateValue(
      character,
      "count",
      Math.max(0, originalMooks - mooks)
    )
  },
}

export default SharedService
