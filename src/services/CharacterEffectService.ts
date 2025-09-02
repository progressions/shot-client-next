import type { Encounter, Character, CharacterEffect } from "@/types"
import CS from "@/services/CharacterService"
import FS from "@/services/FightService"

const CharacterEffectService = {
  adjustedMainAttack: function (
    character: Character,
    encounter: Encounter
  ): [number, number] {
    const mainAttack = CS.mainAttack(character)
    return this.adjustedActionValue(character, mainAttack, encounter, false)
  },

  effectsForCharacter: function (
    character: Character,
    effects: CharacterEffect[],
    name: string
  ): CharacterEffect[] {
    return effects.filter((e: CharacterEffect) => {
      if (e.action_value === name) {
        return true
      }
      return (
        e.action_value === "MainAttack" && name === CS.mainAttack(character)
      )
    })
  },

  adjustedDamage: function (
    character: Character,
    encounter: Encounter
  ): [number, number] {
    return this.adjustedActionValue(character, "Damage", encounter, true)
  },

  adjustedActionValue: function (
    character: Character,
    name: string,
    encounter: Encounter,
    ignoreImpairments: boolean = false
  ): [number, number] {
    const effects = FS.characterEffects(encounter, character)
    const matchingEffects = this.effectsForCharacter(character, effects, name)
    const value1 = CS.rawActionValue(character, name)
    const value2 = value1 - (ignoreImpairments ? 0 : CS.impairments(character))

    return this.actionValueAdjustedByEffects(
      character,
      matchingEffects,
      value1,
      value2
    )
  },

  adjustedValue: function (
    character: Character,
    value: number,
    name: string,
    encounter: Encounter,
    ignoreImpairments: boolean = false
  ): [number, number] {
    const effects = FS.characterEffects(encounter, character)
    const matchingEffects = this.effectsForCharacter(character, effects, name)
    const value1 = value
    const value2 = value1 - (ignoreImpairments ? 0 : CS.impairments(character))

    return this.actionValueAdjustedByEffects(
      character,
      matchingEffects,
      value1,
      value2
    )
  },

  actionValueAdjustedByEffects: function (
    character: Character,
    effects: CharacterEffect[],
    value1: number,
    value2: number
  ): [number, number] {
    const effect = effects[0]

    if (effect) {
      if (["+", "-"].includes(effect.change?.[0] as string)) {
        const newValue2 = value2 + parseInt(effect.change as string)
        return this.actionValueAdjustedByEffects(
          character,
          effects.slice(1),
          value1,
          newValue2
        )
      }
      // Absolute value - parse the string to a number
      const newValue2 = parseInt(effect.change as string) || 0
      return this.actionValueAdjustedByEffects(
        character,
        effects.slice(1),
        value1,
        newValue2
      )
    }

    return this.adjustedReturnValue(value1, value2)
  },

  adjustedReturnValue: function (
    original: number,
    newValue: number
  ): [number, number] {
    return [this.valueChange(original, newValue), newValue]
  },

  valueChange: function (original: number, newValue: number): number {
    return newValue - original
  },
}

export default CharacterEffectService
