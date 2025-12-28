import type { Character, Encounter, Shot } from "@/types"
import { CS } from "@/services"

// Type for a character update to be sent to the backend
export interface CharacterUpdate {
  shot_id?: string
  character_id?: string
  shot?: number
  wounds?: number
  count?: number
  impairments?: number
  action_values?: Record<string, number>
  event?: {
    type: string
    description: string
    details?: Record<string, unknown>
  }
}

// Type for the context needed by all handlers
export interface CombatContext {
  encounter: Encounter
  attackerShot: Shot
  attacker: Character
  allShots: Shot[]
  shotCost: number
  weaponDamage: number
  attackValue: string
  swerve: string
  defenseValue: string
  toastSuccess: (message: string) => void
  toastInfo: (message: string) => void
}

// Helper to create attacker shot update
export function createAttackerUpdate(
  attackerShot: Shot,
  attacker: Character,
  shotCost: number,
  fortuneSpent?: boolean
): CharacterUpdate {
  const currentShot = attackerShot.shot || 0
  const newShot = currentShot - shotCost

  console.log("[createAttackerUpdate] Creating update:", {
    attacker: attacker.name,
    currentShot,
    shotCost,
    newShot,
    shot_id: attackerShot.character?.shot_id,
    character_id: attackerShot.character?.id,
  })

  const update: CharacterUpdate = {
    shot_id: attackerShot.character?.shot_id,
    character_id: attackerShot.character?.id,
    shot: newShot,
    event: {
      type: "act",
      description: `${attacker.name} acts (${shotCost} shots)`,
      details: {
        character_id: attackerShot.character?.id,
        shot_cost: shotCost,
        from_shot: currentShot,
        to_shot: newShot,
      },
    },
  }

  // If attacker is spending fortune for extra damage
  if (fortuneSpent && CS.isPC(attacker)) {
    const currentFortune = CS.fortune(attacker)
    if (currentFortune > 0) {
      update.action_values = {
        Fortune: currentFortune - 1,
      }
    }
  }

  return update
}

// Helper to create dodge update
export function createDodgeUpdate(
  targetShot: Shot,
  targetChar: Character,
  defenseChoice: string
): CharacterUpdate {
  const currentShot = targetShot.shot || 0
  const newShot = currentShot - 1

  const update: CharacterUpdate = {
    shot_id: targetChar.shot_id,
    character_id: targetChar.id,
    shot: newShot,
    event: {
      type: "dodge",
      description:
        defenseChoice === "fortune"
          ? `${targetChar.name} dodges with fortune`
          : `${targetChar.name} dodges`,
      details: {
        character_id: targetChar.id,
        dodge_type: defenseChoice,
        from_shot: currentShot,
        to_shot: newShot,
      },
    },
  }

  // If using fortune dodge, update fortune points for PCs
  if (defenseChoice === "fortune" && CS.isPC(targetChar)) {
    const currentFortune = CS.fortune(targetChar)
    if (currentFortune > 0) {
      update.action_values = {
        Fortune: currentFortune - 1,
      }
    }
  }

  return update
}

// Helper to create wound update for a target
export function createWoundUpdate(
  targetChar: Character,
  targetShot: Shot,
  wounds: number,
  impairments: number,
  attacker: Character,
  attackerShot: Shot,
  context: {
    attackValue: number
    defenseValue: number
    swerve: number
    weaponDamage: number
    shotCost: number
    stunt?: boolean
    defenseChoice?: string
    fortuneDie?: number
    isMookTakedown?: boolean
  }
): CharacterUpdate {
  const isPC = CS.isPC(targetChar)
  const isMook = CS.isMook(targetChar)
  const currentWounds = CS.wounds(targetChar)
  const newWounds = isMook
    ? Math.max(0, currentWounds - wounds) // Reduce mook count
    : currentWounds + wounds // Add wounds for non-mooks

  const defenseDesc =
    context.defenseChoice === "fortune"
      ? ` (Fortune dodge +3 +${context.fortuneDie || 0})`
      : context.defenseChoice === "dodge"
        ? " (Dodge +3)"
        : ""

  const description =
    isMook && context.isMookTakedown
      ? `${attacker.name} took out ${wounds} ${wounds === 1 ? "mook" : "mooks"}${defenseDesc}`
      : `${attacker.name} attacked ${targetChar.name}${defenseDesc} for ${wounds} wounds`

  console.log(`[createWoundUpdate] Creating update for ${targetChar.name}:`, {
    impairments,
    wounds,
    newWounds: isMook
      ? Math.max(0, currentWounds - wounds)
      : currentWounds + wounds,
  })

  const update: CharacterUpdate = {
    shot_id: targetChar.shot_id,
    character_id: targetChar.id,
    impairments,
    event: {
      type: "attack",
      description,
      details: {
        attacker_id: attackerShot.character?.id,
        target_id: targetChar.id,
        damage: wounds,
        attack_value: context.attackValue,
        defense_value: context.defenseValue,
        swerve: context.swerve,
        outcome: context.attackValue + context.swerve - context.defenseValue,
        weapon_damage: context.weaponDamage,
        shot_cost: context.shotCost,
        stunt: context.stunt,
        dodge: !!context.defenseChoice && context.defenseChoice !== "none",
        defense_choice: context.defenseChoice,
        fortune_die: context.fortuneDie,
        is_mook_takedown: context.isMookTakedown,
        mooks_taken_out: context.isMookTakedown ? wounds : undefined,
      },
    },
  }

  // For PCs, update action values (wounds go there)
  if (isPC) {
    update.action_values = {
      Wounds: newWounds,
    }
  } else {
    // For NPCs and mooks, wounds/count go on the shot record
    if (isMook) {
      update.count = newWounds
    } else {
      // Send incremental wounds, not total - backend adds to current count
      update.wounds = wounds
    }
  }

  return update
}

// Helper to create mook vs mook wound update
export function createMookVsMookUpdate(
  targetChar: Character,
  mooksEliminated: number,
  attackerName: string,
  attackerShot: Shot,
  attackingMookCount: number,
  successfulHits: number,
  context: {
    attackValue: number
    defenseValue: number
    shotCost: number
  }
): CharacterUpdate {
  const currentCount = targetChar.count || 0
  const newCount = Math.max(0, currentCount - mooksEliminated)

  return {
    shot_id: targetChar.shot_id || "",
    character_id: targetChar.id,
    count: newCount,
    impairments: 0, // Mooks don't have impairments
    event: {
      type: "attack",
      description: `${attackingMookCount} ${attackerName} attacked ${targetChar.name}, eliminating ${mooksEliminated} mook${mooksEliminated !== 1 ? "s" : ""}`,
      details: {
        attacker_id: attackerShot.character?.id,
        target_id: targetChar.id,
        mooks_eliminated: mooksEliminated,
        attack_value: context.attackValue,
        defense_value: context.defenseValue,
        shot_cost: context.shotCost,
        is_mook_vs_mook: true,
        attacking_mooks: attackingMookCount,
        successful_hits: successfulHits,
      },
    },
  }
}

// Helper to create mook vs non-mook wound update
export function createMookVsNonMookUpdate(
  targetChar: Character,
  totalWounds: number,
  attackerName: string,
  attackerShot: Shot,
  mookCount: number,
  mookHits: number,
  context: {
    attackValue: number
    defenseValue: number
    weaponDamage: number
    shotCost: number
  }
): CharacterUpdate {
  const isPC = CS.isPC(targetChar)
  const currentWounds = CS.wounds(targetChar)
  const newWounds = currentWounds + totalWounds

  // Calculate impairments
  const originalImpairments = targetChar.impairments || 0
  const impairmentChange = CS.calculateImpairments(
    targetChar,
    currentWounds,
    newWounds
  )
  const newImpairments = originalImpairments + impairmentChange

  const update: CharacterUpdate = {
    shot_id: targetChar.shot_id || "",
    character_id: targetChar.id,
    impairments: newImpairments,
    event: {
      type: "attack",
      description: `${mookCount} ${attackerName} attacked ${targetChar.name} for ${totalWounds} wounds`,
      details: {
        attacker_id: attackerShot.character?.id,
        target_id: targetChar.id,
        damage: totalWounds,
        attack_value: context.attackValue,
        defense_value: context.defenseValue,
        weapon_damage: context.weaponDamage,
        shot_cost: context.shotCost,
        is_mook_attack: true,
        mook_count: mookCount,
        mook_hits: mookHits,
      },
    },
  }

  // For PCs, update action values (wounds go there)
  if (isPC) {
    update.action_values = {
      Wounds: newWounds,
    }
  } else {
    // For NPCs, wounds go on the shot record
    // Send incremental wounds, not total - backend adds to current count
    update.wounds = totalWounds
  }

  return update
}
