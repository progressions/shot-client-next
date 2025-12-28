import { CS, CES } from "@/services"
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

  // Get defense with effects properly applied
  let defense: number
  if (encounter) {
    // Use adjustedActionValue to get defense with all effects and impairments
    const [_defenseChange, adjustedDefense] = CES.adjustedActionValue(
      target,
      "Defense",
      encounter,
      false // don't ignore impairments
    )
    defense = adjustedDefense
  } else {
    // No encounter, just use base defense
    defense = CS.defense(target)
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
 * Calculates defense and toughness values based on selected targets and current state.
 */
interface GetDefenseAndToughnessValuesParams {
  targetIds: string[]
  allShots: Shot[]
  attacker: Character | undefined
  stunt: boolean
  defenseChoicePerTarget: { [key: string]: "none" | "dodge" | "fortune" }
  fortuneDiePerTarget: { [key: string]: string }
  manualDefensePerTarget: { [key: string]: string }
  targetMookCount: number
  targetMookCountPerTarget: { [key: string]: number }
  encounter: Encounter
}

interface GetDefenseAndToughnessValuesResult {
  defenseValue: string
  toughnessValue: string
}

export function getDefenseAndToughnessValues({
  targetIds,
  allShots,
  attacker,
  stunt,
  defenseChoicePerTarget,
  fortuneDiePerTarget,
  manualDefensePerTarget,
  targetMookCount,
  targetMookCountPerTarget,
  encounter,
}: GetDefenseAndToughnessValuesParams): GetDefenseAndToughnessValuesResult {
  let defenseValue = "0"
  let toughnessValue = "0"

  if (targetIds.length === 0) {
    return { defenseValue, toughnessValue }
  }

  const targets = targetIds
    .map(id => allShots.find(s => s.character?.shot_id === id)?.character)
    .filter((char): char is Character => char !== undefined)

  if (targetIds.length === 1) {
    const target = targets[0]
    const targetId = targetIds[0]
    if (target) {
      const finalDefense = calculateTargetDefense(
        target,
        targetId,
        manualDefensePerTarget,
        defenseChoicePerTarget,
        fortuneDiePerTarget,
        stunt,
        attacker,
        CS.isMook(target)
          ? targetMookCountPerTarget[targetId] || targetMookCount || 1
          : 1,
        encounter
      )

      const [_toughnessChange, toughness] = CES.adjustedActionValue(
        target,
        "Toughness",
        encounter,
        true
      )
      defenseValue = finalDefense.toString()
      toughnessValue = toughness.toString()
    }
  } else {
    if (attacker && CS.isMook(attacker)) {
      const defenses = targetIds.map((id, index) => {
        const target = targets[index]
        if (!target) return 0
        return calculateTargetDefense(
          target,
          id,
          manualDefensePerTarget,
          defenseChoicePerTarget,
          fortuneDiePerTarget,
          stunt,
          attacker,
          targetMookCount,
          encounter
        )
      })
      defenseValue = Math.max(...defenses).toString()
      toughnessValue = "0"
    } else {
      const allTargetsAreMooks = targets.every(t => CS.isMook(t))
      if (allTargetsAreMooks) {
        const defenses = targetIds.map((id, index) => {
          const target = targets[index]
          if (!target) return 0
          const mookCount = targetMookCountPerTarget[id] || 1
          return calculateTargetDefense(
            target,
            id,
            manualDefensePerTarget,
            defenseChoicePerTarget,
            fortuneDiePerTarget,
            stunt,
            attacker,
            mookCount,
            encounter
          )
        })
        const highestDefense = Math.max(...defenses)
        defenseValue = (highestDefense + targetIds.length).toString()
        toughnessValue = "0"
      } else {
        const defenses = targetIds.map((id, index) => {
          const target = targets[index]
          if (!target) return 0
          return calculateTargetDefense(
            target,
            id,
            manualDefensePerTarget,
            defenseChoicePerTarget,
            fortuneDiePerTarget,
            stunt,
            attacker,
            targetMookCount,
            encounter
          )
        })
        const highestDefense = Math.max(...defenses)
        defenseValue = (highestDefense + targetIds.length).toString()
        toughnessValue = "0"
      }
    }
  }

  return { defenseValue, toughnessValue }
}

interface MultiTargetResult {
  targetId: string
  targetName: string
  defense: number
  toughness: number
  wounds: number
}

interface CalculateNonMookDamageOutcomeParams {
  attacker: Character
  swerve: string
  attackValue: string
  defenseValue: string
  weaponDamage: string
  fortuneBonus: string
  selectedTargetIds: string[]
  allShots: Shot[]
  targetMookCount: number
  targetMookCountPerTarget: { [key: string]: number }
  manualDefensePerTarget: { [key: string]: string }
  manualToughnessPerTarget: { [key: string]: string }
  encounter: Encounter
  calculateEffectiveAttackValue: () => number
}

interface CalculateNonMookDamageOutcomeResult {
  multiTargetResults: MultiTargetResult[]
  showMultiTargetResults: boolean
  smackdown: string
  finalDamage: string
}

export function calculateNonMookDamageOutcome({
  attacker,
  swerve,
  attackValue,
  defenseValue,
  weaponDamage,
  fortuneBonus,
  selectedTargetIds,
  allShots,
  targetMookCount,
  targetMookCountPerTarget,
  manualDefensePerTarget,
  manualToughnessPerTarget,
  encounter,
  calculateEffectiveAttackValue,
}: CalculateNonMookDamageOutcomeParams): CalculateNonMookDamageOutcomeResult {
  let multiTargetResults: MultiTargetResult[] = []
  let showMultiTargetResults = false
  let smackdown = ""
  let finalDamage = "0"

  if (!attacker || CS.isMook(attacker)) {
    return {
      multiTargetResults,
      showMultiTargetResults,
      smackdown,
      finalDamage,
    }
  }

  if (swerve && attackValue && defenseValue) {
    const av = calculateEffectiveAttackValue()
    const dv = parseInt(defenseValue) || 0
    const sw = parseInt(swerve) || 0
    const weaponDmg = parseInt(weaponDamage) || 0
    const fortuneVal = parseInt(fortuneBonus || "0") || 0

    const outcome = av - dv + sw + fortuneVal

    if (selectedTargetIds.length > 0) {
      multiTargetResults = selectedTargetIds
        .map(targetId => {
          const targetShot = allShots.find(
            s => s.character?.shot_id === targetId
          )
          const targetChar = targetShot?.character
          if (!targetChar) return null

          // Use manual defense override if set, otherwise use effects-adjusted defense
          const targetDefense = manualDefensePerTarget[targetId]
            ? parseInt(manualDefensePerTarget[targetId])
            : CES.adjustedActionValue(
                targetChar,
                "Defense",
                encounter,
                false
              )[1]
          // Use manual toughness override if set, otherwise use effects-adjusted toughness
          const targetToughness = manualToughnessPerTarget[targetId]
            ? parseInt(manualToughnessPerTarget[targetId])
            : CES.adjustedActionValue(
                targetChar,
                "Toughness",
                encounter,
                true
              )[1]
          let wounds = 0

          if (CS.isMook(targetChar) && !CS.isMook(attacker)) {
            if (outcome >= 0) {
              wounds =
                targetMookCountPerTarget[targetId] || targetMookCount || 1
            }
          } else {
            if (outcome >= 0) {
              const calculatedSmackdown = outcome + weaponDmg
              wounds = Math.max(0, calculatedSmackdown - targetToughness)
            }
          }

          return {
            targetId,
            targetName: targetChar.name,
            defense: targetDefense,
            toughness: targetToughness,
            wounds,
          }
        })
        .filter(r => r !== null) as MultiTargetResult[]

      smackdown = (outcome >= 0 ? outcome + weaponDmg : 0).toString()
      finalDamage = multiTargetResults
        .reduce((sum, r) => sum + r.wounds, 0)
        .toString()
      showMultiTargetResults = true
    }
  }

  return { multiTargetResults, showMultiTargetResults, smackdown, finalDamage }
}

interface InitializeAttackerPropertiesParams {
  attacker: Character
  encounterWeapons: Record<string, Weapon>
  encounter: Encounter
}

export function initializeAttackerProperties({
  attacker,
  encounterWeapons,
  encounter,
}: InitializeAttackerPropertiesParams): Partial<AttackFormData> {
  const mainAttack = CS.mainAttack(attacker)
  const [, av] = CES.adjustedActionValue(attacker, mainAttack, encounter, false)
  const [effectsOnlyChange] = CES.adjustedActionValue(
    attacker,
    mainAttack,
    encounter,
    true
  )

  const weaponIds = attacker.weapon_ids || []
  const charWeapons = weaponIds
    .map(id => encounterWeapons[id])
    .filter((weapon): weapon is Weapon => weapon !== undefined)

  const updates: Partial<AttackFormData> = {
    attackSkill: mainAttack,
    attackValueChange: effectsOnlyChange,
  }

  if (charWeapons.length > 0) {
    const firstWeapon = charWeapons[0]
    updates.selectedWeaponId = firstWeapon.id?.toString() || ""
    const [damageChange] = CES.adjustedActionValue(
      attacker,
      "Damage",
      encounter,
      true
    )
    updates.weaponDamage = (firstWeapon.damage + damageChange).toString()
    updates.damageChange = damageChange
  } else {
    updates.selectedWeaponId = "unarmed"
    const baseDamage = CS.damage(attacker) || 7
    const [damageChange] = CES.adjustedActionValue(
      attacker,
      "Damage",
      encounter,
      true
    )
    updates.weaponDamage = (baseDamage + damageChange).toString()
    updates.damageChange = damageChange
  }

  updates.attackValue = av.toString()
  updates.shotCost = CS.isBoss(attacker) || CS.isUberBoss(attacker) ? "2" : "3"

  if (CS.isMook(attacker)) {
    updates.mookDistribution = {}
  }

  return updates
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

interface RecalculateMookDefenseParams {
  selectedTargetIds: string[]
  attacker: Character | undefined
  allShots: Shot[]
  targetMookCountPerTarget: { [key: string]: number }
  stunt: boolean
  manualDefensePerTarget: { [key: string]: string }
  defenseChoicePerTarget: { [key: string]: "none" | "dodge" | "fortune" }
  fortuneDiePerTarget: { [key: string]: string }
  encounter: Encounter
}

export function recalculateMookDefense({
  selectedTargetIds,
  attacker,
  allShots,
  targetMookCountPerTarget,
  stunt,
  manualDefensePerTarget,
  defenseChoicePerTarget,
  fortuneDiePerTarget,
  encounter,
}: RecalculateMookDefenseParams): string | undefined {
  if (!attacker || CS.isMook(attacker)) {
    return undefined
  }

  const targets = selectedTargetIds
    .map(id => allShots.find(s => s.character?.shot_id === id)?.character)
    .filter((char): char is Character => char !== undefined)

  if (selectedTargetIds.length > 1) {
    const allTargetsAreMooks = targets.every(t => CS.isMook(t))
    if (
      allTargetsAreMooks &&
      Object.keys(targetMookCountPerTarget).length > 0
    ) {
      const defenses = selectedTargetIds.map((id, index) => {
        const target = targets[index]
        if (!target) return 0
        const mookCount = targetMookCountPerTarget[id] || 1
        return calculateTargetDefense(
          target,
          id,
          manualDefensePerTarget,
          defenseChoicePerTarget,
          fortuneDiePerTarget,
          stunt,
          attacker,
          mookCount,
          encounter
        )
      })
      const highestDefense = Math.max(...defenses)
      return (highestDefense + selectedTargetIds.length).toString()
    }
  } else if (selectedTargetIds.length === 1) {
    const targetId = selectedTargetIds[0]
    const target = allShots.find(
      s => s.character?.shot_id === targetId
    )?.character
    if (target && CS.isMook(target) && targetMookCountPerTarget[targetId]) {
      const finalDefense = calculateTargetDefense(
        target,
        targetId,
        manualDefensePerTarget,
        defenseChoicePerTarget,
        fortuneDiePerTarget,
        stunt,
        attacker,
        targetMookCountPerTarget[targetId],
        encounter
      )
      return finalDefense.toString()
    }
  }
  return undefined
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
