import type { Character } from "@/types"

/**
 * Generate defense modifier text for a character
 * This is the SINGLE SOURCE OF TRUTH for defense modifier display
 */
export const getDefenseModifiersText = (
  char: Character,
  stunt: boolean,
  defenseChoice?: 'none' | 'dodge' | 'fortune',
  fortuneDie?: string
): string => {
  const modifiers: string[] = []
  
  // Stunt modifier
  if (stunt) {
    modifiers.push("+2 Stunt")
  }
  
  // Dodge modifiers
  if (defenseChoice === 'dodge') {
    modifiers.push("+3 Dodge")
  } else if (defenseChoice === 'fortune') {
    const fortuneDieValue = parseInt(fortuneDie || "0")
    modifiers.push(`+${3 + fortuneDieValue} Fortune`)
  }
  
  // Impairment modifier
  if (char.impairments && char.impairments > 0) {
    modifiers.push(`-${char.impairments} Impairment`)
  }
  
  return modifiers.length > 0 ? `Defense: ${modifiers.join(", ")}` : ""
}

/**
 * Get defense modifiers as an array (for custom formatting)
 */
export const getDefenseModifiers = (
  char: Character,
  stunt: boolean,
  defenseChoice?: 'none' | 'dodge' | 'fortune',
  fortuneDie?: string
): string[] => {
  const modifiers: string[] = []
  
  if (stunt) {
    modifiers.push("+2 Stunt")
  }
  
  if (defenseChoice === 'dodge') {
    modifiers.push("+3 Dodge")
  } else if (defenseChoice === 'fortune') {
    const fortuneDieValue = parseInt(fortuneDie || "0")
    modifiers.push(`+${3 + fortuneDieValue} Fortune`)
  }
  
  if (char.impairments && char.impairments > 0) {
    modifiers.push(`-${char.impairments} Impairment`)
  }
  
  return modifiers
}