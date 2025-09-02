import type { Character, Encounter, Shot, Weapon } from "@/types"
import { CS } from "@/services"
import {
  CharacterUpdate,
  createAttackerUpdate,
  createDodgeUpdate,
  createWoundUpdate,
  createMookVsMookUpdate,
  createMookVsNonMookUpdate,
} from "./combatHandlers"

interface MultiTargetResult {
  targetId: string
  targetName: string
  defense: number
  toughness: number
  wounds: number
}

interface MookRoll {
  targetId: string
  targetName: string
  rolls: Array<{
    mookNumber: number
    swerve: number
    actionResult: number
    outcome: number
    hit: boolean
    wounds: number
  }>
}

// Handle non-mook attacker with multiple targets
export async function handleNonMookMultipleTargets(
  client: any,
  encounter: Encounter,
  attackerShot: Shot,
  attacker: Character,
  allShots: Shot[],
  multiTargetResults: MultiTargetResult[],
  shotCost: number,
  weaponDamage: string,
  attackValue: string,
  swerve: string,
  defenseValue: string,
  stunt: boolean,
  selectedTargetIds: string[],
  defenseChoicePerTarget: Record<string, string>,
  fortuneDiePerTarget: Record<string, string>,
  targetMookCount: number,
  calculateTargetDefense: (target: Character, targetId: string) => number,
  calculateEffectiveAttackValue: (
    attacker: Character,
    weapons: Weapon[],
    shots: Shot[]
  ) => number,
  attackerWeapons: Weapon[],
  toastSuccess: (msg: string) => void,
  toastInfo: (msg: string) => void,
  toastError: (msg: string) => void,
  formState: any
): Promise<void> {
  const shots = parseInt(shotCost) || 3
  const characterUpdates: CharacterUpdate[] = []

  // Add attacker's shot spending
  const attackerUpdate = createAttackerUpdate(
    attackerShot,
    attacker,
    shots,
    formState.data.fortuneSpent
  )
  characterUpdates.push(attackerUpdate)

  // Add dodge actions for targets that have dodge selected
  for (const targetId of selectedTargetIds) {
    const choice = defenseChoicePerTarget[targetId]
    if (choice === "dodge" || choice === "fortune") {
      const targetShot = allShots.find(s => s.character?.shot_id === targetId)
      const targetChar = targetShot?.character
      if (targetChar && targetShot) {
        const dodgeUpdate = createDodgeUpdate(
          targetShot,
          targetChar,
          choice,
          fortuneDiePerTarget[targetId]
        )
        characterUpdates.push(dodgeUpdate)

        if (choice === "fortune") {
          const fortuneRoll = fortuneDiePerTarget[targetId] || "0"
          toastInfo(
            `${targetChar.name} dodged with fortune (+3 +${fortuneRoll} DV, -1 shot, -1 fortune)`
          )
        } else {
          toastInfo(`${targetChar.name} dodged (+3 DV, -1 shot)`)
        }
      }
    }
  }

  // Collect wounds updates for each target
  for (const result of multiTargetResults) {
    const targetShot = allShots.find(
      s => s.character?.shot_id === result.targetId
    )
    const targetChar = targetShot?.character
    if (!targetChar) continue

    // Calculate effective wounds considering defense choices
    const currentDefense = calculateTargetDefense(targetChar, result.targetId)
    const hasDefenseModifier =
      defenseChoicePerTarget[result.targetId] &&
      defenseChoicePerTarget[result.targetId] !== "none"

    let effectiveWounds = result.wounds
    if (hasDefenseModifier && selectedTargetIds.length > 1) {
      // For multiple targets with dodge, recalculate outcome for this specific target
      const individualOutcome =
        parseInt(attackValue || "0") + parseInt(swerve || "0") - currentDefense
      if (individualOutcome >= 0) {
        // For mooks, wounds = number taken out; for others, calculate normally
        if (CS.isMook(targetChar)) {
          effectiveWounds = targetMookCount // Still take out the targeted number if hit
        } else {
          const individualSmackdown =
            individualOutcome + parseInt(weaponDamage || "0")
          effectiveWounds = Math.max(
            0,
            individualSmackdown - CS.toughness(targetChar)
          )
        }
      } else {
        effectiveWounds = 0
      }
    }

    if (effectiveWounds === 0) continue // Skip targets with no wounds

    const currentWounds = CS.wounds(targetChar)
    const newWounds = CS.isMook(targetChar)
      ? Math.max(0, currentWounds - effectiveWounds) // Reduce mook count
      : currentWounds + effectiveWounds // Add wounds for non-mooks

    // Calculate impairments
    const originalImpairments = targetChar.impairments || 0
    const impairmentChange = CS.calculateImpairments(
      targetChar,
      currentWounds,
      newWounds
    )
    const newImpairments = originalImpairments + impairmentChange

    // Debug logging for impairment calculation
    if (!CS.isMook(targetChar)) {
      console.log(`[Impairment Debug] ${targetChar.name}:`, {
        currentWounds,
        newWounds,
        effectiveWounds,
        originalImpairments,
        impairmentChange,
        newImpairments,
        type: CS.type(targetChar),
      })
    }

    const defenseChoice = defenseChoicePerTarget[result.targetId] || "none"
    const fortuneDie =
      defenseChoice === "fortune"
        ? parseInt(fortuneDiePerTarget[result.targetId] || "0")
        : undefined

    const woundUpdate = createWoundUpdate(
      targetChar,
      targetShot,
      effectiveWounds,
      newImpairments,
      attacker,
      attackerShot,
      {
        attackValue: calculateEffectiveAttackValue(
          attacker,
          attackerWeapons,
          allShots
        ),
        defenseValue: parseInt(defenseValue),
        swerve: parseInt(swerve),
        weaponDamage: parseInt(weaponDamage),
        shotCost: shots,
        stunt,
        defenseChoice,
        fortuneDie,
        isMookTakedown: CS.isMook(targetChar),
      }
    )

    characterUpdates.push(woundUpdate)

    const isMook = CS.isMook(targetChar)
    const toastMessage = isMook
      ? `Took out ${effectiveWounds} ${effectiveWounds === 1 ? "mook" : "mooks"}`
      : `Applied ${effectiveWounds} wound${effectiveWounds !== 1 ? "s" : ""} to ${targetChar.name}`
    toastSuccess(toastMessage)
  }

  // Send all character updates in a single batched request
  if (characterUpdates.length > 0) {
    console.log("[Apply Damage] Sending character updates:", characterUpdates)
    await client.applyCombatAction(encounter, characterUpdates)
  }
}

// Handle mook attackers
export async function handleMookAttack(
  client: any,
  encounter: Encounter,
  attackerShot: Shot,
  attacker: Character,
  allShots: Shot[],
  mookRolls: MookRoll[],
  shotCost: number,
  weaponDamage: string,
  calculateEffectiveAttackValue: (
    attacker: Character,
    weapons: Weapon[],
    shots: Shot[]
  ) => number,
  attackerWeapons: Weapon[],
  toastSuccess: (msg: string) => void,
  toastError: (msg: string) => void
): Promise<void> {
  const shots = parseInt(shotCost) || 3
  const characterUpdates: CharacterUpdate[] = []

  // Add attacker's shot spending
  if (attackerShot) {
    const attackerUpdate = createAttackerUpdate(attackerShot, attacker, shots)
    characterUpdates.push(attackerUpdate)
  }

  // Collect wounds updates for each target
  for (const targetGroup of mookRolls) {
    const targetShot = allShots.find(
      s => s.character?.shot_id === targetGroup.targetId
    )
    const targetChar = targetShot?.character
    if (!targetChar) continue

    const totalWounds = targetGroup.rolls.reduce((sum, r) => sum + r.wounds, 0)
    if (totalWounds === 0) continue // Skip targets with no wounds

    // Check if this is mook vs mook combat
    if (CS.isMook(targetChar)) {
      // Mook vs mook: reduce mook count instead of applying wounds
      const update = createMookVsMookUpdate(
        targetChar,
        totalWounds,
        attacker.name,
        attackerShot,
        targetGroup.rolls.length,
        targetGroup.rolls.filter(r => r.hit).length,
        {
          attackValue: calculateEffectiveAttackValue(
            attacker,
            attackerWeapons,
            allShots
          ),
          defenseValue: CS.defense(targetChar),
          shotCost: shots,
        }
      )
      characterUpdates.push(update)
      toastSuccess(
        `Eliminated ${totalWounds} ${targetChar.name}${totalWounds !== 1 ? "s" : ""}`
      )
    } else {
      // Mook vs non-mook: apply wounds normally
      const update = createMookVsNonMookUpdate(
        targetChar,
        totalWounds,
        attacker.name,
        attackerShot,
        targetGroup.rolls.length,
        targetGroup.rolls.filter(r => r.hit).length,
        {
          attackValue: calculateEffectiveAttackValue(
            attacker,
            attackerWeapons,
            allShots
          ),
          defenseValue: CS.defense(targetChar),
          weaponDamage: parseInt(weaponDamage),
          shotCost: shots,
        }
      )
      characterUpdates.push(update)
      toastSuccess(
        `Applied ${totalWounds} wound${totalWounds !== 1 ? "s" : ""} to ${targetChar.name}`
      )
    }
  }

  // Send all character updates in a single batched request
  if (characterUpdates.length > 0) {
    console.log("[Apply Damage] Sending character updates:", characterUpdates)
    await client.applyCombatAction(encounter, characterUpdates)
  }
}

// Handle single target attack
export async function handleSingleTargetAttack(
  client: any,
  encounter: Encounter,
  attackerShot: Shot,
  attacker: Character,
  targetChar: Character,
  finalDamage: string,
  toughnessValue: string,
  shotCost: number,
  attackValue: string,
  defenseValue: string,
  swerve: string,
  weaponDamage: string,
  stunt: boolean,
  toastSuccess: (msg: string) => void,
  toastError: (msg: string) => void
): Promise<void> {
  const shots = parseInt(shotCost) || 3
  const damage = parseInt(finalDamage) || 0

  const characterUpdates: CharacterUpdate[] = []

  // Add attacker's shot spending
  const attackerUpdate = createAttackerUpdate(attackerShot, attacker, shots)
  characterUpdates.push(attackerUpdate)

  // Calculate actual wounds
  let actualWoundsDealt = 0
  let newImpairments = 0

  if (CS.isMook(targetChar)) {
    // For mooks, the damage is the number to eliminate
    actualWoundsDealt = damage
  } else {
    // For non-mooks, subtract toughness from smackdown
    const toughness = parseInt(toughnessValue) || CS.toughness(targetChar) || 0
    actualWoundsDealt = Math.max(0, damage - toughness)

    const currentWounds = CS.wounds(targetChar)
    const newWounds = currentWounds + actualWoundsDealt

    // Calculate impairments
    const originalImpairments = targetChar.impairments || 0
    const impairmentChange = CS.calculateImpairments(
      targetChar,
      currentWounds,
      newWounds
    )
    newImpairments = originalImpairments + impairmentChange

    // Debug logging for impairment calculation
    console.log(`[Impairment Debug - Single] ${targetChar.name}:`, {
      currentWounds,
      newWounds,
      actualWoundsDealt,
      originalImpairments,
      impairmentChange,
      newImpairments,
      type: CS.type(targetChar),
    })
  }

  // Create wound update
  const woundUpdate = createWoundUpdate(
    targetChar,
    { character: targetChar } as Shot, // Minimal shot object for single target
    actualWoundsDealt,
    newImpairments,
    attacker,
    attackerShot,
    {
      attackValue: parseInt(attackValue),
      defenseValue: parseInt(defenseValue),
      swerve: parseInt(swerve),
      weaponDamage: parseInt(weaponDamage),
      shotCost: shots,
      stunt,
      isMookTakedown: CS.isMook(targetChar),
    }
  )

  characterUpdates.push(woundUpdate)

  // Send combat action
  await client.applyCombatAction(encounter, characterUpdates)

  toastSuccess(
    `Applied ${actualWoundsDealt} wound${actualWoundsDealt !== 1 ? "s" : ""} to ${targetChar.name}`
  )
}
