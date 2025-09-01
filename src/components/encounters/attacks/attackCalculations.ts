import { CS } from "@/services"
import type { Character, Shot, Weapon } from "@/types"

/**
 * Calculate the effective attack value considering mook bonuses
 */
export const calculateEffectiveAttackValue = (
  attacker: Character | undefined,
  weapons: Weapon[],
  allShots: Shot[]
): number => {
  if (!attacker) return 0
  
  const baseAttack = parseInt(CS.actionValue(attacker, CS.mainAttack(attacker)).toString()) || 0
  
  // Check if any target is a mook
  const attackingMooks = allShots.some(s => s.character && CS.isMook(s.character))
  
  // Apply mook bonus if applicable
  if (attackingMooks && !CS.isMook(attacker)) {
    // Non-mooks get +2 when attacking mooks
    return baseAttack + 2
  }
  
  return baseAttack
}

/**
 * Calculate the effective defense for a target based on their defense choice
 */
export const calculateTargetDefense = (
  target: Character,
  targetId: string,
  manualDefensePerTarget: { [key: string]: string },
  defenseChoicePerTarget: { [key: string]: 'none' | 'dodge' | 'fortune' },
  fortuneDiePerTarget: { [key: string]: string },
  stunt: boolean,
  attacker?: Character,
  targetMookCount?: number
): number => {
  // If there's a manual override, use that
  if (manualDefensePerTarget[targetId]) {
    return parseInt(manualDefensePerTarget[targetId]) || 0
  }
  
  let defense = CS.defense(target)
  const choice = defenseChoicePerTarget[targetId] || 'none'
  
  if (choice === 'dodge') {
    defense += 3
  } else if (choice === 'fortune') {
    const fortuneDie = parseInt(fortuneDiePerTarget[targetId] || "0")
    defense += 3 + fortuneDie
  }
  
  if (stunt) {
    defense += 2
  }
  
  // Add mook count to defense if targeting multiple mooks
  if (CS.isMook(target) && attacker && !CS.isMook(attacker) && targetMookCount && targetMookCount > 1) {
    defense += targetMookCount
  }
  
  // Apply impairments
  if (target.impairments > 0) {
    defense -= target.impairments
  }
  
  return defense
}

/**
 * Calculate attack value with impairments
 */
export const calculateAttackWithImpairments = (
  baseAttack: number,
  attacker?: Character
): number => {
  if (!attacker) return baseAttack
  
  // Apply impairments
  if (attacker.impairments > 0) {
    return baseAttack - attacker.impairments
  }
  
  return baseAttack
}

/**
 * Calculate wounds based on attack outcome
 */
export const calculateWounds = (
  outcome: number,
  weaponDamage: number,
  target: Character,
  targetMookCount?: number
): number => {
  if (outcome < 0) return 0
  
  // Special handling for mooks
  if (CS.isMook(target)) {
    // For mooks, if the attack succeeds, the attacker takes out the targeted number
    return targetMookCount || 0
  }
  
  // Normal wound calculation for non-mooks
  const smackdown = outcome + weaponDamage
  const toughness = CS.toughness(target)
  return Math.max(0, smackdown - toughness)
}

/**
 * Calculate combined defense for multiple targets
 */
export const calculateCombinedDefense = (
  targetIds: string[],
  allShots: Shot[],
  attacker: Character | undefined,
  stunt: boolean
): number => {
  if (targetIds.length === 0) return 0
  
  const targets = targetIds.map(id => 
    allShots.find(s => s.character?.shot_id === id)?.character
  ).filter((char): char is Character => char !== undefined)
  
  if (targetIds.length === 1) {
    // Single target - return actual defense
    const target = targets[0]
    if (target) {
      let defense = CS.defense(target)
      if (stunt) defense += 2
      return defense
    }
    return 0
  }
  
  // Multiple targets
  if (attacker && CS.isMook(attacker)) {
    // Mooks attacking multiple targets - just show highest for reference
    const defenses = targets.map(t => {
      let defense = CS.defense(t)
      if (stunt) defense += 2
      return defense
    })
    return Math.max(...defenses)
  } else {
    // Non-mook attacking multiple targets - highest defense + number of targets
    const defenses = targets.map(t => {
      let defense = CS.defense(t)
      if (stunt) defense += 2
      return defense
    })
    const highestDefense = Math.max(...defenses)
    return highestDefense + targetIds.length
  }
}

/**
 * Distribute mooks evenly among targets
 */
export const distributeMooksAmongTargets = (
  totalMooks: number,
  targetIds: string[]
): { [targetId: string]: number } => {
  const targetCount = targetIds.length
  
  if (targetCount === 0) {
    return {}
  }
  
  const mooksPerTarget = Math.floor(totalMooks / targetCount)
  const remainder = totalMooks % targetCount
  
  const distribution: { [targetId: string]: number } = {}
  targetIds.forEach((id, index) => {
    distribution[id] = mooksPerTarget + (index < remainder ? 1 : 0)
  })
  
  return distribution
}