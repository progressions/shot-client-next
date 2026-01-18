import type { AttackFormData } from "@/types"

/**
 * Helper function to handle mook distribution updates
 * Manages the distribution of attacking mooks across multiple targets
 */
export const updateMookDistribution = (
  targetId: string,
  newValue: number,
  selectedTargetIds: string[],
  mookDistribution: { [targetId: string]: number },
  totalMooksAvailable: number,
  updateField: (name: keyof AttackFormData, value: unknown) => void
): void => {
  const validValue = Math.max(0, newValue)

  // If there are exactly 2 targets, auto-adjust the other one
  if (selectedTargetIds.length === 2) {
    const otherId = selectedTargetIds.find(tid => tid !== targetId)
    if (!otherId) return

    // Ensure we don't exceed total mooks
    const finalValue = Math.min(validValue, totalMooksAvailable)
    const remainingMooks = Math.max(0, totalMooksAvailable - finalValue)

    updateField("mookDistribution", {
      [targetId]: finalValue,
      [otherId]: remainingMooks,
    })
    updateField("totalAttackingMooks", totalMooksAvailable)
  } else {
    // For more than 2 targets, just update this one
    const otherTargetIds = selectedTargetIds.filter(tid => tid !== targetId)
    const otherMooks = otherTargetIds.reduce(
      (sum, tid) => sum + (mookDistribution[tid] || 0),
      0
    )

    // Ensure we don't exceed total mooks
    const maxForThisTarget = totalMooksAvailable - otherMooks
    const finalValue = Math.min(validValue, maxForThisTarget)

    const newDistribution = {
      ...mookDistribution,
      [targetId]: finalValue,
    }
    const newTotal = Object.values(newDistribution).reduce(
      (sum, val) => sum + val,
      0
    )

    updateField("mookDistribution", newDistribution)
    updateField("totalAttackingMooks", newTotal)
  }
}

/**
 * Determines the character types that should be shown as targets based on the attacker
 */
export const getTargetCharacterTypes = (
  attacker:
    | {
        character_type?: string
      }
    | undefined,
  isPC: (char: { character_type?: string }) => boolean,
  isAlly: (char: { character_type?: string }) => boolean,
  isMook: (char: { character_type?: string }) => boolean,
  isFeaturedFoe: (char: { character_type?: string }) => boolean,
  isBoss: (char: { character_type?: string }) => boolean,
  isUberBoss: (char: { character_type?: string }) => boolean
): string[] | undefined => {
  if (!attacker) return undefined

  // If attacker is PC or Ally, show enemies
  if (isPC(attacker) || isAlly(attacker)) {
    return ["Uber-Boss", "Boss", "Featured Foe", "Mook"]
  }

  // If attacker is enemy, show PCs and Allies
  if (
    isMook(attacker) ||
    isFeaturedFoe(attacker) ||
    isBoss(attacker) ||
    isUberBoss(attacker)
  ) {
    return ["PC", "Ally"]
  }

  return undefined
}
