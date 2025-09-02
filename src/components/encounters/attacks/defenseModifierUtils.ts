import type { Character, Encounter } from "@/types"
import { CharacterEffectService as CES, CS } from "@/services"

/**
 * Generate defense modifier text for a character
 * This is the SINGLE SOURCE OF TRUTH for defense modifier display
 */
export const getDefenseModifiersText = (
  char: Character,
  stunt: boolean,
  defenseChoice?: "none" | "dodge" | "fortune",
  fortuneDie?: string,
  encounter?: Encounter | null,
  effectType?: "Defense" | "Toughness"
): string => {
  const modifiers: string[] = []

  // Stunt modifier (only for Defense)
  if (stunt && effectType !== "Toughness") {
    modifiers.push("+2 Stunt")
  }

  // Dodge modifiers (only for Defense)
  if (effectType !== "Toughness") {
    if (defenseChoice === "dodge") {
      modifiers.push("+3 Dodge")
    } else if (defenseChoice === "fortune") {
      const fortuneDieValue = parseInt(fortuneDie || "0")
      modifiers.push(`+${3 + fortuneDieValue} Fortune`)
    }
  }

  // Impairment modifier (only for Defense, not Toughness)
  if (char.impairments && char.impairments > 0 && effectType !== "Toughness") {
    const impairmentText = char.impairments === 1 ? "impairment" : "impairments"
    modifiers.push(`-${char.impairments} ${impairmentText}`)
  }

  // Effects modifier
  if (encounter && effectType) {
    const baseValue =
      effectType === "Defense"
        ? CS.rawActionValue(char, "Defense")
        : CS.toughness(char)

    // For Defense, we need to get just the effects without impairments
    // So we calculate with ignoreImpairments=true to get just the effect change
    const [effectOnlyChange] = CES.adjustedValue(
      char,
      baseValue,
      effectType,
      encounter,
      true // always ignore impairments to get just the effect change
    )

    if (effectOnlyChange !== 0) {
      modifiers.push(
        `${effectOnlyChange > 0 ? "+" : ""}${effectOnlyChange} from effects`
      )
    }
  }

  const prefix = effectType ? `${effectType}: ` : "Defense: "
  return modifiers.length > 0 ? `${prefix}${modifiers.join(", ")}` : ""
}

/**
 * Get defense modifiers as an array (for custom formatting)
 */
export const getDefenseModifiers = (
  char: Character,
  stunt: boolean,
  defenseChoice?: "none" | "dodge" | "fortune",
  fortuneDie?: string
): string[] => {
  const modifiers: string[] = []

  if (stunt) {
    modifiers.push("+2 Stunt")
  }

  if (defenseChoice === "dodge") {
    modifiers.push("+3 Dodge")
  } else if (defenseChoice === "fortune") {
    const fortuneDieValue = parseInt(fortuneDie || "0")
    modifiers.push(`+${3 + fortuneDieValue} Fortune`)
  }

  if (char.impairments && char.impairments > 0) {
    const impairmentText = char.impairments === 1 ? "impairment" : "impairments"
    modifiers.push(`-${char.impairments} ${impairmentText}`)
  }

  return modifiers
}
