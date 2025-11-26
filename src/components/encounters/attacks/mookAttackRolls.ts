import { CS, DS } from "@/services"
import type { Character, Shot, Weapon } from "@/types"

export interface MookRollResult {
  mookNumber: number
  swerve: number
  actionResult: number
  outcome: number
  hit: boolean
  wounds: number
}

interface MookTargetRolls {
  targetId: string
  targetName: string
  rolls: MookRollResult[]
}

interface MookAttackRollsOutput {
  mookRolls: MookTargetRolls[]
  finalDamage: string
}

interface CalculateMookRollsParams {
  attacker: Character
  attackerWeapons: Weapon[]
  allShots: Shot[]
  selectedTargetIds: string[]
  mookDistribution: Record<string, number>
  fortuneBonus: string
  calculateEffectiveAttackValue: (
    attacker: Character,
    weapons: Weapon[],
    shots: Shot[]
  ) => number
  weaponDamage: string
  defenseValue: string
  toughnessValue: string
  targetShotId: string
  totalAttackingMooks: number
}

export function calculateMookRolls({
  attacker,
  attackerWeapons,
  allShots,
  selectedTargetIds,
  mookDistribution,
  fortuneBonus,
  calculateEffectiveAttackValue,
  weaponDamage,
  defenseValue,
  toughnessValue,
  targetShotId,
  totalAttackingMooks,
}: CalculateMookRollsParams): MookAttackRollsOutput | null {
  if (!attacker || !CS.isMook(attacker)) return null

  const av = calculateEffectiveAttackValue(attacker, attackerWeapons, allShots)
  const weaponDmg = parseInt(weaponDamage) || 0

  const allTargetRolls: MookTargetRolls[] = []
  let grandTotalWounds = 0

  // If we have multiple selected targets, roll for each
  if (selectedTargetIds.length > 0) {
    selectedTargetIds.forEach(targetId => {
      const targetShot = allShots.find(s => s.character?.shot_id === targetId)
      const targetChar = targetShot?.character
      if (!targetChar) return

      const mookCount = mookDistribution[targetId] || 0
      if (mookCount === 0) return

      // Get defense and toughness for this specific target
      const targetDefense = CS.defense(targetChar)
      const targetToughness = CS.toughness(targetChar)

      const targetRolls: MookRollResult[] = []
      let targetTotalWounds = 0

      for (let i = 1; i <= mookCount; i++) {
        // Roll swerve for each mook
        const swerveRoll = DS.rollSwerve()
        const fortuneVal = parseInt(fortuneBonus || "0")
        const actionResult = av + swerveRoll.result + fortuneVal
        const outcome = actionResult - targetDefense
        const hit = outcome >= 0

        let wounds = 0
        if (hit) {
          // Check if target is also a mook
          if (CS.isMook(targetChar)) {
            // Mook vs mook: each hit eliminates 1 mook (no toughness calculation)
            wounds = 1 // Represents 1 mook eliminated
          } else {
            // Mook vs non-mook: calculate smackdown and wounds normally
            const smackdown = outcome + weaponDmg
            wounds = Math.max(0, smackdown - targetToughness)
          }
          targetTotalWounds += wounds
        }

        targetRolls.push({
          mookNumber: i,
          swerve: swerveRoll.result,
          actionResult,
          outcome,
          hit,
          wounds,
        })
      }

      grandTotalWounds += targetTotalWounds
      allTargetRolls.push({
        targetId,
        targetName: targetChar.name,
        rolls: targetRolls,
      })
    })
  } else if (targetShotId) {
    // Fallback to single target mode
    const targetShot = allShots.find(s => s.character?.shot_id === targetShotId)
    const targetChar = targetShot?.character
    if (!targetChar) return null

    const mookCount = totalAttackingMooks || attacker.count || 0
    const dv = parseInt(defenseValue) || 0
    const toughness = parseInt(toughnessValue) || 0

    const targetRolls: MookRollResult[] = []
    let targetTotalWounds = 0

    for (let i = 1; i <= mookCount; i++) {
      const swerveRoll = DS.rollSwerve()
      const fortuneVal = parseInt(fortuneBonus || "0")
      const actionResult = av + swerveRoll.result + fortuneVal
      const outcome = actionResult - dv
      const hit = outcome >= 0

      let wounds = 0
      if (hit) {
        // Check if target is also a mook
        if (CS.isMook(targetChar)) {
          // Mook vs mook: each hit eliminates 1 mook (no toughness calculation)
          wounds = 1 // Represents 1 mook eliminated
        } else {
          // Mook vs non-mook: calculate smackdown and wounds normally
          const smackdown = outcome + weaponDmg
          wounds = Math.max(0, smackdown - toughness)
        }
        targetTotalWounds += wounds
      }

      targetRolls.push({
        mookNumber: i,
        swerve: swerveRoll.result,
        actionResult,
        outcome,
        hit,
        wounds,
      })
    }

    grandTotalWounds = targetTotalWounds
    allTargetRolls.push({
      targetId: targetShotId,
      targetName: targetChar.name,
      rolls: targetRolls,
    })
  }

  return {
    mookRolls: allTargetRolls,
    finalDamage: grandTotalWounds.toString(),
  }
}
