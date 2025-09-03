import { CS, CES } from "@/services"
import type { Character, Shot, Encounter } from "@/types"

/**
 * Sort shots for attacker selection
 * Order: Shot number (desc) -> Character Type -> Speed (desc) -> Name (asc)
 * Type order: Uber-Boss, Boss, PC, Ally, Featured Foe, Mook
 */
export const sortAttackerShots = (
  shots: Shot[],
  encounter?: Encounter
): Shot[] => {
  const typeOrder: Record<string, number> = {
    "Uber-Boss": 1,
    Boss: 2,
    PC: 3,
    Ally: 4,
    "Featured Foe": 5,
    Mook: 6,
  }

  return [...shots].sort((a, b) => {
    // First sort by shot position (higher shots first - shot 20 before shot 15)
    if (a.shot !== b.shot) {
      return (b.shot || 0) - (a.shot || 0)
    }

    const charA = a.character
    const charB = b.character

    if (!charA || !charB) return 0

    // Then sort by character type priority
    const typeA = CS.type(charA)
    const typeB = CS.type(charB)
    const orderA = typeOrder[typeA] || 999
    const orderB = typeOrder[typeB] || 999

    if (orderA !== orderB) {
      return orderA - orderB
    }

    // Then sort by Speed (higher speed first)
    // Get adjusted speed values if encounter is provided
    let speedA = CS.speed(charA) || 0
    let speedB = CS.speed(charB) || 0

    if (encounter) {
      // Get adjusted speed accounting for effects but not impairments
      const [, adjustedSpeedA] = CES.adjustedValue(
        charA,
        speedA,
        "Speed",
        encounter,
        true
      )
      const [, adjustedSpeedB] = CES.adjustedValue(
        charB,
        speedB,
        "Speed",
        encounter,
        true
      )
      speedA = adjustedSpeedA
      speedB = adjustedSpeedB
    }

    if (speedA !== speedB) {
      return speedB - speedA
    }

    // Finally sort by name alphabetically (ascending)
    const nameA = charA.name || ""
    const nameB = charB.name || ""

    return nameA.localeCompare(nameB)
  })
}

/**
 * Sort shots for target selection based on attacker type
 */
export const sortTargetShots = (
  shots: Shot[],
  attacker: Character | undefined
): Shot[] => {
  if (!attacker) return shots

  const attackerType = CS.type(attacker)
  const isNPCAttacker = ["Mook", "Featured Foe", "Boss", "Uber-Boss"].includes(
    attackerType
  )

  if (!isNPCAttacker) {
    // If attacker is not an NPC, return normal order
    return shots
  }

  // Sort: PCs first, then Allies, then others
  return [...shots].sort((a, b) => {
    const charA = a.character
    const charB = b.character

    if (!charA || !charB) return 0

    const typeA = CS.type(charA)
    const typeB = CS.type(charB)

    const isPC_A = typeA === "PC"
    const isPC_B = typeB === "PC"
    const isAlly_A = typeA === "Ally"
    const isAlly_B = typeB === "Ally"

    // PCs come first
    if (isPC_A && !isPC_B) return -1
    if (!isPC_A && isPC_B) return 1

    // Then Allies
    if (isAlly_A && !isAlly_B && !isPC_B) return -1
    if (!isAlly_A && isAlly_B && !isPC_A) return 1

    // Others remain in original order
    return 0
  })
}

/**
 * Get all visible shots from encounter
 */
export const getAllVisibleShots = (encounterShots: unknown[]): Shot[] => {
  const shots: Shot[] = []
  let index = 0

  // Handle undefined or null encounterShots
  if (!encounterShots || !Array.isArray(encounterShots)) {
    return shots
  }

  encounterShots.forEach(shotGroupUnknown => {
    const shotGroup = shotGroupUnknown as Record<string, unknown>
    // Only include if shot value is not null (not hidden)
    if (shotGroup.shot !== null && shotGroup.shot !== undefined) {
      if (shotGroup.characters && Array.isArray(shotGroup.characters)) {
        shotGroup.characters.forEach((char: Character) => {
          shots.push({
            ...shotGroup,
            character: char,
            characters: [char],
            // Add a unique index for handling duplicate names
            uniqueIndex: index++,
          } as Shot)
        })
      }
    }
  })

  return shots
}
