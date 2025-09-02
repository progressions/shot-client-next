import { CS, CharacterEffectService } from "@/services"
import type { Character, Shot, Weapon, Encounter } from "@/types"

/**
 * Calculate the effective attack value considering mook bonuses
 */
export const calculateEffectiveAttackValue = (
  attacker: Character | undefined,
  weapons: Weapon[],
  allShots: Shot[]
): number => {
  if (!attacker) return 0

  const baseAttack =
    parseInt(CS.actionValue(attacker, CS.mainAttack(attacker)).toString()) || 0

  // Check if any target is a mook
  const attackingMooks = allShots.some(
    s => s.character && CS.isMook(s.character)
  )

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
  defenseChoicePerTarget: { [key: string]: "none" | "dodge" | "fortune" },
  fortuneDiePerTarget: { [key: string]: string },
  stunt: boolean,
  attacker?: Character,
  targetMookCount?: number,
  encounter?: Encounter | null
): number => {
  // If there's a manual override, use that
  if (manualDefensePerTarget[targetId]) {
    return parseInt(manualDefensePerTarget[targetId]) || 0
  }

  // Start with defense that already includes impairments
  let defense = CS.defense(target)
  
  // Add effects if encounter exists
  if (encounter) {
    const baseValue = CS.rawActionValue(target, "Defense")
    const [effectChange] = CharacterEffectService.adjustedValue(
      target,
      baseValue,
      "Defense",
      encounter,
      true // ignore impairments since CS.defense already includes them
    )
    defense += effectChange
  }

  const choice = defenseChoicePerTarget[targetId] || "none"

  if (choice === "dodge") {
    defense += 3
  } else if (choice === "fortune") {
    const fortuneDie = parseInt(fortuneDiePerTarget[targetId] || "0")
    defense += 3 + fortuneDie
  }

  if (stunt) {
    defense += 2
  }

  // Add mook count to defense if targeting multiple mooks
  if (
    CS.isMook(target) &&
    attacker &&
    !CS.isMook(attacker) &&
    targetMookCount &&
    targetMookCount > 1
  ) {
    defense += targetMookCount
  }

  // Don't apply impairments again - CS.defense already includes them

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
  stunt: boolean,
  targetMookCountPerTarget?: { [targetId: string]: number }
): number => {
  if (targetIds.length === 0) return 0

  const targets = targetIds
    .map(id => ({
      id,
      character: allShots.find(s => s.character?.shot_id === id)?.character,
    }))
    .filter(
      (t): t is { id: string; character: Character } =>
        t.character !== undefined
    )

  if (targetIds.length === 1) {
    // Single target - return actual defense
    const target = targets[0]
    if (target.character) {
      let defense = CS.defense(target.character)

      // Add mook count if targeting multiple mooks in a single group
      if (CS.isMook(target.character) && targetMookCountPerTarget) {
        const count = targetMookCountPerTarget[target.id] || 1
        if (count > 1) {
          defense += count
        }
      }

      if (stunt) defense += 2
      return defense
    }
    return 0
  }

  // Multiple targets
  if (attacker && CS.isMook(attacker)) {
    // Mooks attacking multiple targets - just show highest for reference
    const defenses = targets.map(t => {
      let defense = CS.defense(t.character)
      if (stunt) defense += 2
      return defense
    })
    return Math.max(...defenses)
  } else {
    // Non-mook attacking multiple targets

    // Check if all targets are mooks
    const allTargetsAreMooks = targets.every(t => CS.isMook(t.character))

    if (allTargetsAreMooks && targetMookCountPerTarget) {
      // Multiple mook groups - calculate each group's defense (base + count), then add number of groups
      const defenses = targets.map(t => {
        let defense = CS.defense(t.character)
        const mookCount = targetMookCountPerTarget[t.id] || 1
        defense += mookCount // Add the number of mooks in this group
        if (stunt) defense += 2
        return defense
      })
      const highestDefense = Math.max(...defenses)
      // Add the number of groups (not individual mooks)
      return highestDefense + targetIds.length
    } else {
      // Mixed or non-mook targets - highest defense + number of targets
      const defenses = targets.map(t => {
        let defense = CS.defense(t.character)
        if (stunt) defense += 2
        return defense
      })
      const highestDefense = Math.max(...defenses)
      return highestDefense + targetIds.length
    }
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
