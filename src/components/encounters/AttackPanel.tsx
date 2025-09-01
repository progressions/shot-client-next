"use client"

import { useMemo, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useEncounter, useToast } from "@/contexts"
import { CS, DS } from "@/services"
import type { Character, Shot, Weapon } from "@/types"
import { useClient } from "@/contexts/AppContext"
import { NumberField } from "@/components/ui"
import AttackerSection from "./attacks/AttackerSection"
import TargetSection from "./attacks/TargetSection"
import WoundsSummary from "./attacks/WoundsSummary"
import MookAttackSection from "./attacks/MookAttackSection"
import { FormActions, useForm } from "@/reducers"

// Define the shape of our form data
type DefenseChoice = 'none' | 'dodge' | 'fortune'

interface AttackFormData {
  // Attacker state
  attackerShotId: string
  attackSkill: string
  attackValue: string
  selectedWeaponId: string
  weaponDamage: string
  shotCost: string
  
  // Target state
  selectedTargetIds: string[]
  targetShotId: string // For backward compatibility
  defenseValue: string
  toughnessValue: string
  stunt: boolean
  targetMookCount: number
  
  // Defense modifiers per target
  defenseChoicePerTarget: { [targetId: string]: DefenseChoice }
  fortuneDiePerTarget: { [targetId: string]: string }
  defenseAppliedPerTarget: { [targetId: string]: boolean }
  manualDefensePerTarget: { [targetId: string]: string }
  manualToughnessPerTarget: { [targetId: string]: string }
  
  // Attack resolution
  swerve: string
  finalDamage: string
  
  // Mook attack state
  mookDistribution: { [targetId: string]: number }
  totalAttackingMooks: number
  mookRolls: Array<{
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
  }>
  showMookRolls: boolean
  
  // Multi-target results
  multiTargetResults: Array<{
    targetId: string
    targetName: string
    defense: number
    toughness: number
    wounds: number
  }>
  showMultiTargetResults: boolean
  
  // Processing state
  isProcessing: boolean
  
  // Allow string keys for FormActions.UPDATE
  [key: string]: unknown
}

interface AttackPanelProps {
  onClose?: () => void
}

export default function AttackPanel({ onClose }: AttackPanelProps) {
  const { encounter, weapons: encounterWeapons, ec } = useEncounter()
  const { toastSuccess, toastError, toastInfo } = useToast()
  const { client } = useClient()

  // Initialize form state with useForm
  const { formState, dispatchForm } = useForm<AttackFormData>({
    // Attacker state
    attackerShotId: "",
    attackSkill: "",
    attackValue: "",
    selectedWeaponId: "",
    weaponDamage: "",
    shotCost: "3",
    
    // Target state
    selectedTargetIds: [],
    targetShotId: "", // For backward compatibility
    defenseValue: "0",
    toughnessValue: "0",
    stunt: false,
    targetMookCount: 1,
    
    // Defense modifiers per target
    defenseChoicePerTarget: {},
    fortuneDiePerTarget: {},
    defenseAppliedPerTarget: {},
    manualDefensePerTarget: {},
    manualToughnessPerTarget: {},
    
    // Attack resolution
    swerve: "",
    finalDamage: "",
    
    // Mook attack state
    mookDistribution: {},
    totalAttackingMooks: 0,
    mookRolls: [],
    showMookRolls: false,
    
    // Multi-target results
    multiTargetResults: [],
    showMultiTargetResults: false,
    
    // Processing state
    isProcessing: false,
  })

  // Destructure commonly used values from formState.data
  const {
    attackerShotId,
    selectedTargetIds,
    attackSkill,
    attackValue,
    defenseValue,
    toughnessValue,
    selectedWeaponId,
    weaponDamage,
    swerve,
    stunt,
    finalDamage,
    shotCost,
    isProcessing,
    mookRolls,
    showMookRolls,
    mookDistribution,
    totalAttackingMooks,
    multiTargetResults,
    showMultiTargetResults,
    targetMookCount,
    defenseChoicePerTarget,
    fortuneDiePerTarget,
    defenseAppliedPerTarget,
    manualDefensePerTarget,
    manualToughnessPerTarget,
    targetShotId,
  } = formState.data

  // Helper function to calculate effective attack value with mook bonus
  const calculateEffectiveAttackValue = (
    attackerChar: Character | undefined,
    weapons: Weapon[],
    allShotsList: Shot[]
  ): number => {
    let baseAttack = parseInt(attackValue) || 0
    
    // Check if any targets are mooks and apply weapon mook bonus
    if (selectedWeaponId && selectedWeaponId !== "unarmed" && selectedTargetIds.length > 0) {
      const weapon = weapons.find(w => w.id?.toString() === selectedWeaponId)
      if (weapon && weapon.mook_bonus > 0) {
        // Check if any selected target is a mook
        const targetingMooks = selectedTargetIds.some(id => {
          const shot = allShotsList.find(s => s.character?.shot_id === id)
          return shot?.character && CS.isMook(shot.character)
        })
        
        if (targetingMooks) {
          baseAttack += weapon.mook_bonus
        }
      }
    }
    
    // Apply attacker's impairment
    if (attackerChar && attackerChar.impairments > 0) {
      baseAttack -= attackerChar.impairments
    }
    
    return baseAttack
  }

  // Helper function to update form field
  const updateField = (name: keyof AttackFormData, value: unknown) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name,
      value,
    })
  }

  // Helper function to update multiple fields at once
  const updateFields = (updates: Partial<AttackFormData>) => {
    Object.entries(updates).forEach(([name, value]) => {
      dispatchForm({
        type: FormActions.UPDATE,
        name,
        value,
      })
    })
  }

  // Get all characters in the fight (excluding hidden ones)
  const allShots = useMemo(() => {
    const shots: Shot[] = []
    let index = 0
    encounter.shots.forEach(shotGroup => {
      // Only include if shot value is not null (not hidden)
      if (shotGroup.shot !== null && shotGroup.shot !== undefined) {
        if (shotGroup.characters) {
          shotGroup.characters.forEach(char => {
            shots.push({
              ...shotGroup,
              character: char as Character,
              characters: [char as Character],
              // Add a unique index for handling duplicate names
              uniqueIndex: index++,
            })
          })
        }
      }
    })
    return shots
  }, [encounter.shots])

  // Sort attacker shots by: shot position (higher first), character type priority, then speed
  const sortedAttackerShots = useMemo(() => {
    const typeOrder: { [key: string]: number } = {
      "Uber-Boss": 1,
      Boss: 2,
      PC: 3,
      Ally: 4,
      "Featured Foe": 5,
      Mook: 6,
    }

    return [...allShots].sort((a, b) => {
      // First sort by shot position (higher shots first - shot 20 before shot 15)
      if (a.shot !== b.shot) {
        return (b.shot || 0) - (a.shot || 0)
      }

      const charA = a.character
      const charB = b.character

      if (!charA || !charB) return 0

      // Then sort by character type priority
      const typeA = typeOrder[CS.type(charA)] || 999
      const typeB = typeOrder[CS.type(charB)] || 999

      if (typeA !== typeB) {
        return typeA - typeB
      }

      // Finally sort by Speed (higher speed first)
      const speedA = CS.speed(charA) || 0
      const speedB = CS.speed(charB) || 0

      return speedB - speedA
    })
  }, [allShots])

  // Get selected attacker and targets
  const attackerShot = allShots.find(
    s => s.character?.shot_id === attackerShotId
  )
  const attacker = attackerShot?.character
  
  // Get all selected targets
  const selectedTargets = selectedTargetIds.map(id => 
    allShots.find(s => s.character?.shot_id === id)?.character
  ).filter((char): char is Character => char !== undefined)
  
  // For backward compatibility
  const target = selectedTargets[0]
  const targetShot = selectedTargetIds[0] ? allShots.find(s => s.character?.shot_id === selectedTargetIds[0]) : undefined

  // Sort targets based on attacker type
  const sortedTargetShots = useMemo(() => {
    if (!attacker) return allShots

    const attackerType = CS.type(attacker)
    const isNPCAttacker = [
      "Mook",
      "Featured Foe",
      "Boss",
      "Uber-Boss",
    ].includes(attackerType)

    if (!isNPCAttacker) {
      // If attacker is not an NPC, return normal order
      return allShots
    }

    // Sort: PCs first, then Allies, then others
    return [...allShots].sort((a, b) => {
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
  }, [allShots, attacker])

  // Get weapons for selected attacker from preloaded encounter weapons
  const attackerWeapons = useMemo(() => {
    if (attacker && "action_values" in attacker) {
      const char = attacker as Character
      const weaponIds = char.weapon_ids || []
      return weaponIds
        .map(id => encounterWeapons[id])
        .filter((weapon): weapon is Weapon => weapon !== undefined)
    }
    return []
  }, [attacker, encounterWeapons])

  // Calculate suggested values when selections change
  useMemo(() => {
    if (attacker && "action_values" in attacker) {
      // Get attack skills
      const mainAttack = CS.mainAttack(attacker)
      const av = CS.actionValue(attacker, mainAttack)
      
      // Get default weapon and damage
      const weaponIds = attacker.weapon_ids || []
      const charWeapons = weaponIds
        .map(id => encounterWeapons[id])
        .filter((weapon): weapon is Weapon => weapon !== undefined)

      const updates: Partial<AttackFormData> = {
        attackSkill: mainAttack,
        attackValue: av.toString(),
      }

      if (charWeapons.length > 0) {
        updates.selectedWeaponId = charWeapons[0].id?.toString() || ""
        updates.weaponDamage = charWeapons[0].damage.toString()
      } else {
        updates.selectedWeaponId = "unarmed"
        updates.weaponDamage = (CS.damage(attacker) || 7).toString()
      }

      // Set shot cost based on character type
      updates.shotCost = (CS.isBoss(attacker) || CS.isUberBoss(attacker)) ? "2" : "3"

      // Set default mook distribution
      if (CS.isMook(attacker)) {
        updates.mookDistribution = {}
      }
      
      updateFields(updates)
    }
  }, [attacker, encounterWeapons, targetShotId])


  // Calculate damage when swerve is entered (only for non-mook attackers)
  useMemo(() => {
    if (attacker && !CS.isMook(attacker)) {
      if (swerve && attackValue && defenseValue) {
        const av = calculateEffectiveAttackValue(attacker, attackerWeapons, allShots)
        const dv = parseInt(defenseValue) || 0
        const sw = parseInt(swerve) || 0
        const weaponDmg = parseInt(weaponDamage) || 0

        const outcome = av - dv + sw

        // Handle all targets the same way (single or multiple)
        if (selectedTargetIds.length > 0) {
          const results = selectedTargetIds.map(targetId => {
            const targetShot = allShots.find(s => s.character?.shot_id === targetId)
            const targetChar = targetShot?.character
            if (!targetChar) return null

            const targetDefense = CS.defense(targetChar)
            const targetToughness = CS.toughness(targetChar)
            
            // For multiple targets, the outcome is already calculated against combined defense
            // The smackdown is the same for all targets
            let wounds = 0
            
            // Special handling for non-mook attacking mooks
            if (CS.isMook(targetChar) && !CS.isMook(attacker)) {
              // For mooks, if the attack succeeds, the attacker takes out the targeted number
              if (outcome >= 0) {
                wounds = targetMookCount // Number of mooks taken out
              }
            } else {
              // Normal wound calculation for non-mooks
              if (outcome >= 0) {
                const smackdown = outcome + weaponDmg
                wounds = Math.max(0, smackdown - targetToughness)
              }
            }

            return {
              targetId,
              targetName: targetChar.name,
              defense: targetDefense,
              toughness: targetToughness,
              wounds
            }
          }).filter(r => r !== null) as typeof multiTargetResults

          // Set finalDamage to smackdown value for the Smackdown field
          let damageValue = ""
          if (selectedTargetIds.length === 1 && results.length === 1) {
            // For single target, the Smackdown field should show smackdown (outcome + weapon damage)
            const smackdown = outcome + weaponDmg
            damageValue = smackdown.toString()
            console.log("Attack calculation:", {
              attackValue: av,
              defense: dv, 
              swerve: sw,
              weaponDamage: weaponDmg,
              outcome,
              smackdown,
              toughness: results[0].toughness,
              wounds: results[0].wounds
            })
          }
          
          updateFields({
            multiTargetResults: results,
            showMultiTargetResults: true,
            finalDamage: damageValue,
          })
        } else {
          // No targets selected
          updateFields({
            multiTargetResults: [],
            showMultiTargetResults: false,
            finalDamage: "0",
          })
        }
      }
    }
  }, [swerve, attackValue, defenseValue, weaponDamage, attacker, selectedTargetIds, allShots, targetMookCount])

  // Reset defense choices when targets change
  useEffect(() => {
    updateFields({
      defenseChoicePerTarget: {},
      fortuneDiePerTarget: {},
      defenseAppliedPerTarget: {},
    })
  }, [selectedTargetIds])

  // Helper function to update defense and toughness based on selected targets
  const updateDefenseAndToughness = (targetIds: string[], includeStunt: boolean = false) => {
    if (targetIds.length === 0) {
      updateFields({
        defenseValue: "0",
        toughnessValue: "0",
        manualDefensePerTarget: {},  // Clear manual overrides
      })
      return
    }

    const targets = targetIds.map(id => 
      allShots.find(s => s.character?.shot_id === id)?.character
    ).filter((char): char is Character => char !== undefined)

    if (targetIds.length === 1) {
      // Single target - show actual defense and toughness
      const target = targets[0]
      const targetId = targetIds[0]
      if (target) {
        let defense = CS.defense(target)
        
        // Add mook count to defense if targeting multiple mooks
        if (CS.isMook(target) && !CS.isMook(attacker) && targetMookCount > 1) {
          defense += targetMookCount
        }
        
        if (includeStunt) defense += 2  // Add stunt modifier
        
        // Update both the main defense value and clear any manual override for this target
        updateFields({
          defenseValue: defense.toString(),
          toughnessValue: CS.toughness(target).toString(),
          manualDefensePerTarget: {
            ...manualDefensePerTarget,
            [targetId]: defense.toString(),  // Set the calculated value as the manual override
          },
        })
      }
    } else {
      // Multiple targets
      if (attacker && CS.isMook(attacker)) {
        // Mooks attacking multiple targets - no defense modifier, just show highest for reference
        const defenses = targets.map(t => {
          let defense = CS.defense(t)
          if (includeStunt) defense += 2  // Add stunt modifier to each target
          return defense
        })
        const highestDefense = Math.max(...defenses)
        updateFields({
          defenseValue: highestDefense.toString(),
          toughnessValue: "0",
        })
      } else {
        // Non-mook attacking multiple targets - highest defense + number of targets
        const defenses = targets.map(t => {
          let defense = CS.defense(t)
          if (includeStunt) defense += 2  // Add stunt modifier to each target
          return defense
        })
        const highestDefense = Math.max(...defenses)
        const combinedDefense = highestDefense + targetIds.length
        updateFields({
          defenseValue: combinedDefense.toString(),
          toughnessValue: "0",
        })
      }
    }
  }

  // Helper function to distribute mooks among targets
  const distributeMooks = (targetIds: string[]) => {
    if (!attacker || !CS.isMook(attacker)) return
    
    const totalMooks = attacker.count || 0
    const targetCount = targetIds.length
    
    if (targetCount === 0) {
      updateFields({
        mookDistribution: {},
        totalAttackingMooks: 0,
      })
      return
    }
    
    const mooksPerTarget = Math.floor(totalMooks / targetCount)
    const remainder = totalMooks % targetCount
    
    const distribution: { [targetId: string]: number } = {}
    targetIds.forEach((id, index) => {
      distribution[id] = mooksPerTarget + (index < remainder ? 1 : 0)
    })
    
    updateFields({
      mookDistribution: distribution,
      totalAttackingMooks: totalMooks,
    })
  }

  // Helper function to calculate effective defense for a target based on their defense choice
  const calculateTargetDefense = (target: Character, targetId: string): number => {
    // If there's a manual override, use that
    if (manualDefensePerTarget[targetId]) {
      return parseInt(manualDefensePerTarget[targetId]) || 0
    }
    
    let defense = CS.defense(target)
    const choice = defenseChoicePerTarget[targetId] || 'none'
    
    if (choice === 'dodge') {
      defense += 3
    } else if (choice === 'fortune') {
      const fortuneRoll = parseInt(fortuneDiePerTarget[targetId] || "0") || 0
      defense += 3 + fortuneRoll
    }
    
    // Add stunt modifier if applicable
    if (stunt) defense += 2
    
    return defense
  }

  // Reset when attacker changes
  useEffect(() => {
    // Initialize total attacking mooks for mook attackers
    const currentAttacker = allShots.find(s => s.character?.shot_id === attackerShotId)?.character
    const totalMooks = (currentAttacker && CS.isMook(currentAttacker)) 
      ? (currentAttacker.count || 0) 
      : 0
    
    updateFields({
      mookRolls: [],
      showMookRolls: false,
      selectedTargetIds: [],
      mookDistribution: {},
      defenseValue: "0",
      toughnessValue: "0",
      swerve: "",  // Reset to empty, not 0
      finalDamage: "",  // Reset to empty, not 0
      defenseChoicePerTarget: {},
      fortuneDiePerTarget: {},
      defenseAppliedPerTarget: {},
      manualDefensePerTarget: {},
      manualToughnessPerTarget: {},
      totalAttackingMooks: totalMooks,
      multiTargetResults: {},  // Clear multi-target results
      showMultiTargetResults: false,  // Hide multi-target results display
    })
  }, [attackerShotId, allShots])
  
  // Clear attack results when targets change
  useEffect(() => {
    // Clear all attack-related results when targets change
    updateFields({
      swerve: "",
      finalDamage: "",
      mookRolls: [],
      showMookRolls: false,
      multiTargetResults: {},
      showMultiTargetResults: false,
    })
    
    // Update defense and toughness for new targets
    if (selectedTargetIds.length > 0) {
      updateDefenseAndToughness(selectedTargetIds, formState.data.stunt)
      
      // If attacker is a mook, distribute mooks among the new targets
      if (attacker && CS.isMook(attacker)) {
        distributeMooks(selectedTargetIds)
      }
    } else {
      // Clear mook distribution when no targets selected
      updateFields({
        mookDistribution: {},
        totalAttackingMooks: 0,
      })
    }
  }, [selectedTargetIds, targetShotId])

  const handleRollMookAttacks = () => {
    if (!attacker || !CS.isMook(attacker)) return

    const av = calculateEffectiveAttackValue(attacker, attackerWeapons, allShots)
    const weaponDmg = parseInt(weaponDamage) || 0
    
    const allTargetRolls = []
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
        
        const targetRolls = []
        let targetTotalWounds = 0

        for (let i = 1; i <= mookCount; i++) {
          // Roll swerve for each mook
          const swerveRoll = DS.rollSwerve()
          const actionResult = av + swerveRoll.result
          const outcome = actionResult - targetDefense
          const hit = outcome >= 0

          let wounds = 0
          if (hit) {
            // Check if target is also a mook
            if (CS.isMook(targetChar)) {
              // Mook vs mook: each hit eliminates 1 mook (no toughness calculation)
              wounds = 1  // Represents 1 mook eliminated
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
      if (!targetChar) return

      const mookCount = totalAttackingMooks || attacker.count || 0
      const dv = parseInt(defenseValue) || 0
      const toughness = parseInt(toughnessValue) || 0
      
      const targetRolls = []
      let targetTotalWounds = 0

      for (let i = 1; i <= mookCount; i++) {
        const swerveRoll = DS.rollSwerve()
        const actionResult = av + swerveRoll.result
        const outcome = actionResult - dv
        const hit = outcome >= 0

        let wounds = 0
        if (hit) {
          // Check if target is also a mook
          if (CS.isMook(targetChar)) {
            // Mook vs mook: each hit eliminates 1 mook (no toughness calculation)
            wounds = 1  // Represents 1 mook eliminated
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

    updateFields({
      mookRolls: allTargetRolls,
      showMookRolls: true,
      finalDamage: grandTotalWounds.toString(),
    })
  }


  const handleApplyDamage = async () => {
    // Handle multiple targets for non-mook attackers
    if (!CS.isMook(attacker) && selectedTargetIds.length > 0 && multiTargetResults.length > 0) {
      updateField("isProcessing", true)
      try {
        const shots = parseInt(shotCost) || 3
        
        // Spend shots for the attacker
        await ec.spendShots(attacker, shots)
        
        // Apply dodges for targets that have dodge selected
        for (const targetId of selectedTargetIds) {
          const choice = defenseChoicePerTarget[targetId]
          if (choice === 'dodge' || choice === 'fortune') {
            const targetShot = allShots.find(s => s.character?.shot_id === targetId)
            const targetChar = targetShot?.character
            if (targetChar) {
              // Spend 1 shot for dodge
              await ec.spendShots(targetChar, 1)
              if (choice === 'fortune') {
                // TODO: Also deduct fortune point when fortune point tracking is implemented
                const fortuneRoll = fortuneDiePerTarget[targetId] || "0"
                toastInfo(`${targetChar.name} dodged with fortune (+3 +${fortuneRoll} DV, -1 shot, -1 fortune)`)
              } else {
                toastInfo(`${targetChar.name} dodged (+3 DV, -1 shot)`)
              }
            }
          }
        }
        
        // Apply wounds to each target
        for (const result of multiTargetResults) {
          const targetShot = allShots.find(s => s.character?.shot_id === result.targetId)
          const targetChar = targetShot?.character
          if (!targetChar) continue
          
          // Calculate effective wounds considering defense choices
          const currentDefense = calculateTargetDefense(targetChar, result.targetId)
          const hasDefenseModifier = defenseChoicePerTarget[result.targetId] && defenseChoicePerTarget[result.targetId] !== 'none'
          
          let effectiveWounds = result.wounds
          if (hasDefenseModifier && selectedTargetIds.length > 1) {
            // For multiple targets with dodge, recalculate outcome for this specific target
            const individualOutcome = parseInt(attackValue || "0") + parseInt(swerve || "0") - currentDefense
            if (individualOutcome >= 0) {
              // For mooks, wounds = number taken out; for others, calculate normally
              if (CS.isMook(targetChar)) {
                effectiveWounds = targetMookCount // Still take out the targeted number if hit
              } else {
                const individualSmackdown = individualOutcome + parseInt(weaponDamage || "0")
                effectiveWounds = Math.max(0, individualSmackdown - CS.toughness(targetChar))
              }
            } else {
              effectiveWounds = 0
            }
          }
          
          if (effectiveWounds === 0) continue // Skip targets with no wounds
          
          const isPC = CS.isPC(targetChar)
          const currentWounds = CS.wounds(targetChar)
          
          // For mooks, reduce the count; for others, add wounds
          const newWounds = CS.isMook(targetChar) 
            ? Math.max(0, currentWounds - effectiveWounds)  // Reduce mook count
            : currentWounds + effectiveWounds  // Add wounds for non-mooks
          
          // Calculate impairments
          const originalImpairments = targetChar.impairments || 0
          const impairmentChange = CS.calculateImpairments(
            targetChar,
            currentWounds,
            newWounds
          )
          const newImpairments = originalImpairments + impairmentChange
          
          // Include defense choice in the description
          const defenseChoice = defenseChoicePerTarget[result.targetId] || 'none'
          const defenseDesc = defenseChoice === 'fortune' 
            ? ` (Fortune dodge +3 +${fortuneDiePerTarget[result.targetId] || 0})`
            : defenseChoice === 'dodge' 
            ? ' (Dodge +3)'
            : ''
          
          // Calculate updated Fortune points if fortune dodge was used
          let updatedFortune: number | undefined
          if (defenseChoice === 'fortune' && CS.isPC(targetChar)) {
            const currentFortune = CS.fortune(targetChar)
            if (currentFortune > 0) {
              updatedFortune = currentFortune - 1
              toastInfo(`${targetChar.name} spent 1 Fortune point for dodge`)
            }
          }
          
          // Send update to backend for this target
          const isMook = CS.isMook(targetChar)
          const description = isMook
            ? `${attacker.name} took out ${effectiveWounds} ${effectiveWounds === 1 ? 'mook' : 'mooks'}${defenseDesc}`
            : `${attacker.name} attacked ${targetChar.name}${defenseDesc} for ${effectiveWounds} wounds`
            
          await client.updateCombatState(
            encounter,
            targetChar.shot_id || "",
            isPC ? newWounds : undefined,
            !isPC ? newWounds : undefined,
            newImpairments,
            {
              type: "attack",
              description,
              details: {
                attacker_id: attackerShot.character?.id,
                target_id: targetChar.id,
                damage: effectiveWounds,
                attack_value: calculateEffectiveAttackValue(attacker, attackerWeapons, allShots),
                defense_value: parseInt(defenseValue),
                effective_defense: calculateTargetDefense(targetChar, result.targetId),
                swerve: parseInt(swerve),
                outcome: calculateEffectiveAttackValue(attacker, attackerWeapons, allShots) + parseInt(swerve) - parseInt(defenseValue),
                weapon_damage: parseInt(weaponDamage),
                shot_cost: shots,
                stunt: stunt,
                dodge: defenseChoice !== 'none',
                defense_choice: defenseChoice,
                fortune_die: defenseChoice === 'fortune' ? parseInt(fortuneDiePerTarget[result.targetId] || "0") : undefined,
                is_mook_takedown: isMook,
                mooks_taken_out: isMook ? effectiveWounds : undefined,
              },
            },
            updatedFortune
          )
          
          const toastMessage = isMook
            ? `Took out ${effectiveWounds} ${effectiveWounds === 1 ? 'mook' : 'mooks'}${defenseDesc}`
            : `Applied ${effectiveWounds} wound${effectiveWounds !== 1 ? "s" : ""} to ${targetChar.name}${defenseDesc}`
          
          toastSuccess(toastMessage)
        }
        
        // Reset form
        updateFields({
          selectedTargetIds: [],
          multiTargetResults: [],
          showMultiTargetResults: false,
          swerve: "",
          finalDamage: "",
          stunt: false,
          defenseChoicePerTarget: {},
          fortuneDiePerTarget: {},
          defenseAppliedPerTarget: {},
          manualDefensePerTarget: {},
          manualToughnessPerTarget: {},
          targetMookCount: 1,
        })
        
        if (onClose) {
          onClose()
        }
        return
      } catch (error) {
        toastError("Failed to apply damage")
      } finally {
        updateField("isProcessing", false)
      }
    }
    
    // Handle multiple targets for mook attackers
    if (CS.isMook(attacker) && selectedTargetIds.length > 1 && mookRolls.length > 0) {
      updateField("isProcessing", true)
      try {
        const shots = parseInt(shotCost) || 3
        
        // Spend shots for the attacker
        await ec.spendShots(attacker, shots)
        
        // Apply wounds to each target
        for (const targetGroup of mookRolls) {
          const targetShot = allShots.find(s => s.character?.shot_id === targetGroup.targetId)
          const targetChar = targetShot?.character
          if (!targetChar) continue
          
          const totalWounds = targetGroup.rolls.reduce((sum, r) => sum + r.wounds, 0)
          if (totalWounds === 0) continue // Skip targets with no wounds
          
          // Check if this is mook vs mook combat
          if (CS.isMook(targetChar)) {
            // Mook vs mook: reduce mook count instead of applying wounds
            const currentCount = targetChar.count || 0
            const newCount = Math.max(0, currentCount - totalWounds)
            
            // Send update to backend for mook elimination
            await client.updateCombatState(
              encounter,
              targetChar.shot_id || "",
              undefined, // No wounds for PCs
              newCount,  // New mook count
              0,         // Mooks don't have impairments
              {
                type: "attack",
                description: `${targetGroup.rolls.length} ${attacker.name} attacked ${targetChar.name}, eliminating ${totalWounds} mook${totalWounds !== 1 ? "s" : ""}`,
                details: {
                  attacker_id: attackerShot.character?.id,
                  target_id: targetChar.id,
                  mooks_eliminated: totalWounds,
                  attack_value: calculateEffectiveAttackValue(attacker, attackerWeapons, allShots),
                  defense_value: CS.defense(targetChar),
                  shot_cost: shots,
                  is_mook_vs_mook: true,
                  attacking_mooks: targetGroup.rolls.length,
                  successful_hits: targetGroup.rolls.filter(r => r.hit).length,
                },
              },
              undefined // No fortune change for mook attacks
            )
            
            toastSuccess(
              `Eliminated ${totalWounds} ${targetChar.name}${totalWounds !== 1 ? "s" : ""}`
            )
          } else {
            // Mook vs non-mook: apply wounds normally
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
            
            // Send update to backend for this target
            await client.updateCombatState(
              encounter,
              targetChar.shot_id || "",
              isPC ? newWounds : undefined,
              !isPC ? newWounds : undefined,
              newImpairments,
              {
                type: "attack",
                description: `${targetGroup.rolls.length} ${attacker.name} attacked ${targetChar.name} for ${totalWounds} wounds`,
                details: {
                  attacker_id: attackerShot.character?.id,
                  target_id: targetChar.id,
                  damage: totalWounds,
                  attack_value: calculateEffectiveAttackValue(attacker, attackerWeapons, allShots),
                  defense_value: CS.defense(targetChar),
                  weapon_damage: parseInt(weaponDamage),
                  shot_cost: shots,
                  is_mook_attack: true,
                  mook_count: targetGroup.rolls.length,
                  mook_hits: targetGroup.rolls.filter(r => r.hit).length,
                },
              },
              undefined // No fortune change for mook attacks
            )
            
            toastSuccess(
              `Applied ${totalWounds} wound${totalWounds !== 1 ? "s" : ""} to ${targetChar.name}`
            )
          }
        }
        
        // Reset form
        updateFields({
          selectedTargetIds: [],
          mookDistribution: {},
          totalAttackingMooks: 0,
          mookRolls: [],
          showMookRolls: false,
          swerve: "",
          finalDamage: "",
          stunt: false,
          defenseChoicePerTarget: {},
          fortuneDiePerTarget: {},
          defenseAppliedPerTarget: {},
        })
        
        if (onClose) {
          onClose()
        }
        return
      } catch (error) {
        toastError("Failed to apply damage")
      } finally {
        updateField("isProcessing", false)
      }
    }
    
    // Original single-target logic
    if (!target || !targetShot || !finalDamage || !attacker || !attackerShot)
      return

    updateField("isProcessing", true)
    try {
      const damage = parseInt(finalDamage) || 0
      const shots = parseInt(shotCost) || 3
      const targetChar = target
      const isPC = CS.isPC(targetChar)

      // Spend shots for the attacker
      await ec.spendShots(attacker, shots)

      // Calculate new wounds and impairments
      let newWounds = 0
      let newImpairments = 0
      let actualWoundsDealt = 0

      if (CS.isMook(targetChar)) {
        // Mooks are eliminated on any hit
        newWounds = 0 // Or reduce count
        actualWoundsDealt = damage // For mooks, show the full damage
      } else if (CS.isMook(attacker)) {
        // When attacker is a mook, wounds have already been calculated with toughness
        // so we apply them directly without reducing by toughness again
        const currentWounds = CS.wounds(targetChar)
        actualWoundsDealt = damage // This is already the final wound count from mook rolls
        newWounds = currentWounds + actualWoundsDealt

        // Calculate impairments
        const originalImpairments = targetChar.impairments || 0
        const impairmentChange = CS.calculateImpairments(
          targetChar,
          currentWounds,
          newWounds
        )
        newImpairments = originalImpairments + impairmentChange
      } else {
        // Regular attack - for single non-mook targets
        const currentWounds = CS.wounds(targetChar)
        
        // The Smackdown field (finalDamage) is always treated as the smackdown value
        // We need to subtract toughness to get actual wounds
        const toughness = parseInt(toughnessValue) || CS.toughness(targetChar) || 0
        actualWoundsDealt = Math.max(0, damage - toughness)
        
        newWounds = currentWounds + actualWoundsDealt

        // Calculate impairments
        const originalImpairments = targetChar.impairments || 0
        const impairmentChange = CS.calculateImpairments(
          targetChar,
          currentWounds,
          newWounds
        )
        newImpairments = originalImpairments + impairmentChange
      }

      // Send update to backend
      await client.updateCombatState(
        encounter,
        targetShot.character?.shot_id || "",
        isPC ? newWounds : undefined,
        !isPC ? newWounds : undefined,
        newImpairments,
        {
          type: "attack",
          description: CS.isMook(attacker)
            ? `${parseInt(targets[0]?.mookCount || attackingMookCount) || attacker.count || 0} ${attacker.name} attacked ${target.name} for ${actualWoundsDealt} wounds`
            : `${attacker.name} attacked ${target.name} for ${actualWoundsDealt} wounds`,
          details: {
            attacker_id: attackerShot.character?.id,
            target_id: target.id,
            damage: damage,
            attack_value: parseInt(attackValue),
            defense_value: parseInt(defenseValue),
            swerve: CS.isMook(attacker) ? undefined : parseInt(swerve),
            outcome: CS.isMook(attacker)
              ? undefined
              : parseInt(attackValue) -
                parseInt(defenseValue) +
                parseInt(swerve),
            weapon_damage: parseInt(weaponDamage),
            shot_cost: shots,
            stunt: stunt,
            is_mook_attack: CS.isMook(attacker),
            mook_count: CS.isMook(attacker) ? attacker.count : undefined,
            mook_hits:
              mookRolls.length > 0
                ? mookRolls.filter(r => r.hit).length
                : undefined,
          },
        },
        undefined // No fortune change for single target mode (doesn't support dodge)
      )

      toastSuccess(
        `Applied ${actualWoundsDealt} wound${actualWoundsDealt !== 1 ? "s" : ""} to ${target.name}`
      )

      // Reset form
      updateFields({
        targetShotId: "",
        swerve: "",
        finalDamage: "",
        stunt: false,
        mookRolls: [],
        showMookRolls: false,
        selectedTargetIds: [],
        mookDistribution: {},
        totalAttackingMooks: 0,
        defenseChoicePerTarget: {},
        fortuneDiePerTarget: {},
        defenseAppliedPerTarget: {},
      })

      if (onClose) {
        onClose()
      }
    } catch (error) {
      toastError("Failed to apply damage")
      console.error(error)
    } finally {
      updateField("isProcessing", false)
    }
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          Attack Resolution
        </Typography>

        {/* Main Content - Attacker then Target */}
        <Box sx={{ backgroundColor: "action.hover" }}>
          {/* Attacker Section */}
          <AttackerSection
            sortedAttackerShots={sortedAttackerShots}
            formState={formState}
            dispatchForm={dispatchForm}
            attacker={attacker}
            attackerWeapons={attackerWeapons}
          />

          {/* Target Section */}
          <TargetSection
            allShots={allShots}
            sortedTargetShots={sortedTargetShots}
            formState={formState}
            dispatchForm={dispatchForm}
            attacker={attacker}
            attackerShotId={attackerShotId}
            updateField={updateField}
            updateFields={updateFields}
            updateDefenseAndToughness={updateDefenseAndToughness}
            distributeMooks={distributeMooks}
            calculateTargetDefense={calculateTargetDefense}
          />
        </Box>

        {/* Bottom Section - Combat Resolution */}
        <Box
          sx={{ p: { xs: 2, sm: 3 }, backgroundColor: "background.default" }}
        >
          <Typography
            variant="h6"
            gutterBottom
            sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}
          >
            🎲 Combat Resolution
          </Typography>

          {/* Show different UI for mook attackers */}
          {attacker && CS.isMook(attacker) ? (
            <MookAttackSection
              attacker={attacker}
              allShots={allShots}
              selectedTargetIds={selectedTargetIds}
              mookRolls={mookRolls}
              showMookRolls={showMookRolls}
              totalAttackingMooks={totalAttackingMooks}
              finalDamage={finalDamage}
              shotCost={shotCost}
              attackValue={attackValue}
              isProcessing={isProcessing}
              updateField={updateField}
              handleRollMookAttacks={handleRollMookAttacks}
              handleApplyDamage={handleApplyDamage}
            />
          ) : (
            <>
              {/* Regular (non-mook) Attack Resolution */}
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 2 }}
                alignItems="center"
                justifyContent="center"
                sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}
              >
                {/* Dice Roll */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: { xs: "80px", sm: "auto" },
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ mb: 0.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    Swerve
                  </Typography>
                  <NumberField
                    name="swerve"
                    value={swerve}
                    size="large"
                    width="120px"
                    error={false}
                    onChange={e => updateField("swerve", e.target.value)}
                    onBlur={e => {
                      const val = e.target.value
                      if (val === "" || val === "-") {
                        updateField("swerve", "0")
                      } else {
                        updateField("swerve", val)
                      }
                    }}
                  />
                </Box>

                {/* Final Damage Override - Show for single non-mook target */}
                {selectedTargetIds.length === 1 && (() => {
                  const targetShot = allShots.find(s => s.character?.shot_id === selectedTargetIds[0])
                  const targetChar = targetShot?.character
                  // Only show Smackdown for non-mooks
                  return targetChar && !CS.isMook(targetChar) ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minWidth: { xs: "80px", sm: "auto" },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ mb: 0.5, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                      >
                        Smackdown
                      </Typography>
                      <NumberField
                        name="finalDamage"
                        value={parseInt(finalDamage) || 0}
                        size="large"
                        width="120px"
                        error={false}
                        onChange={e => updateField("finalDamage", e.target.value)}
                        onBlur={e => updateField("finalDamage", e.target.value)}
                      />
                    </Box>
                  ) : null
                })()}

                {/* Apply Damage Button */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                    height: "100%",
                    pt: { xs: "8px", sm: "20px" },
                    width: { xs: "100%", sm: "auto" },
                    mt: { xs: 2, sm: 0 },
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleApplyDamage}
                    disabled={(!target && selectedTargetIds.length === 0) || (!finalDamage && !showMultiTargetResults) || isProcessing}
                    size="large"
                    startIcon={<CheckCircleIcon />}
                    sx={{
                      height: 56,
                      px: { xs: 2, sm: 3 },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    Resolve
                  </Button>
                  {attacker && target && finalDamage && shotCost && (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        fontSize: { xs: "0.65rem", sm: "0.7rem" },
                        textAlign: "left",
                        color: "text.secondary",
                      }}
                    >
                      {showMultiTargetResults && multiTargetResults.length > 0
                        ? `Apply wounds to ${multiTargetResults.length} ${multiTargetResults.length === 1 ? 'target' : 'targets'}, spend ${shotCost} ${parseInt(shotCost) === 1 ? 'shot' : 'shots'}`
                        : parseInt(finalDamage) > 0
                        ? `Apply ${finalDamage} ${parseInt(finalDamage) === 1 ? 'wound' : 'wounds'}, spend ${shotCost} ${parseInt(shotCost) === 1 ? 'shot' : 'shots'}`
                        : `Spend ${shotCost} ${parseInt(shotCost) === 1 ? 'shot' : 'shots'}`}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </>
          )}

          {/* Attack Results for Non-Mook Attackers (single or multiple targets) */}
          {!CS.isMook(attacker) && showMultiTargetResults && multiTargetResults.length > 0 && (
            <Box sx={{ width: "100%", mt: 3 }}>
              {/* Overall attack calculation */}
              {(() => {
                const effectiveAttack = calculateEffectiveAttackValue(attacker, attackerWeapons, allShots)
                const mookBonus = effectiveAttack - parseInt(attackValue || "0")
                const outcome = effectiveAttack + parseInt(swerve || "0") - parseInt(defenseValue || "0")
                const isHit = outcome >= 0
                const defenseLabel = selectedTargetIds.length === 1 ? "Defense" : "Combined Defense"
                const attackDisplay = mookBonus > 0 
                  ? `${attackValue} (+${mookBonus} vs mooks)` 
                  : attackValue
                
                return (
                  <Alert severity={isHit ? "success" : "error"} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                      {isHit ? "Hit!" : "Miss!"} Attack Value {attackDisplay} + Swerve {swerve} = Action Result {effectiveAttack + parseInt(swerve || "0")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                      Action Result {effectiveAttack + parseInt(swerve || "0")} - {defenseLabel} {defenseValue} = Outcome {outcome}
                    </Typography>
                    {isHit && (
                      <Typography variant="caption" sx={{ display: "block" }}>
                        Outcome {outcome} + Weapon Damage {weaponDamage} = Smackdown {outcome + parseInt(weaponDamage || "0")}
                      </Typography>
                    )}
                  </Alert>
                )
              })()}

              {/* Individual target results */}
              <Stack spacing={2}>
                {multiTargetResults.map((result) => {
                  const targetShot = allShots.find(s => s.character?.shot_id === result.targetId)
                  const targetChar = targetShot?.character
                  if (!targetChar) return null
                  
                  const currentDefense = calculateTargetDefense(targetChar, result.targetId)
                  const hasDefenseModifier = defenseChoicePerTarget[result.targetId] && defenseChoicePerTarget[result.targetId] !== 'none'
                  
                  // Calculate smackdown for this target
                  let individualOutcome: number
                  let smackdown: number
                  let effectiveWounds = result.wounds
                  
                  if (hasDefenseModifier && selectedTargetIds.length > 1) {
                    // For multiple targets with dodge, recalculate outcome for this specific target
                    individualOutcome = calculateEffectiveAttackValue(attacker, attackerWeapons, allShots) + parseInt(swerve || "0") - currentDefense
                    if (individualOutcome >= 0) {
                      smackdown = individualOutcome + parseInt(weaponDamage || "0")
                      // For mooks, wounds = number taken out; for others, calculate normally
                      effectiveWounds = CS.isMook(targetChar) 
                        ? targetMookCount 
                        : Math.max(0, smackdown - CS.toughness(targetChar))
                    } else {
                      smackdown = individualOutcome + parseInt(weaponDamage || "0") // Still calculate smackdown even on miss
                      effectiveWounds = 0
                    }
                  } else {
                    // Use the standard calculation or manual override for single target
                    const outcome = calculateEffectiveAttackValue(attacker, attackerWeapons, allShots) + parseInt(swerve || "0") - parseInt(defenseValue || "0")
                    
                    // For single target, check if there's a manual smackdown override
                    if (selectedTargetIds.length === 1 && finalDamage) {
                      // User has manually set the smackdown
                      smackdown = parseInt(finalDamage || "0")
                      // Calculate wounds from manual smackdown
                      effectiveWounds = Math.max(0, smackdown - CS.toughness(targetChar))
                    } else {
                      // Use calculated smackdown
                      smackdown = outcome + parseInt(weaponDamage || "0")
                      effectiveWounds = result.wounds
                    }
                  }
                  
                  return (
                    <Alert key={result.targetId} severity="info" sx={{ pb: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                        Target: {result.targetName}
                      </Typography>
                      <Typography variant="body2">
                        Defense: {currentDefense} (base {result.defense}
                        {defenseChoicePerTarget[result.targetId] === 'dodge' && ', +3 dodged'}
                        {defenseChoicePerTarget[result.targetId] === 'fortune' && `, +3 +${fortuneDiePerTarget[result.targetId] || 0} fortune`})
                      </Typography>
                      {!CS.isMook(targetChar) && (
                        <Typography variant="body2">
                          Toughness: {result.toughness}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ fontWeight: "bold", mt: 1 }}>
                        {CS.isMook(targetChar) 
                          ? <strong>Takes out {effectiveWounds} {effectiveWounds === 1 ? 'mook' : 'mooks'}</strong>
                          : <>Smackdown {smackdown} - Toughness {result.toughness} = <strong>{effectiveWounds} {effectiveWounds === 1 ? 'wound' : 'wounds'}</strong></>
                        }
                      </Typography>
                    </Alert>
                  )
                })}
              </Stack>

              {/* Summary of wounds to apply */}
              <WoundsSummary
                multiTargetResults={multiTargetResults}
                allShots={allShots}
                calculateTargetDefense={calculateTargetDefense}
                defenseChoicePerTarget={defenseChoicePerTarget}
                selectedTargetIds={selectedTargetIds}
                attackValue={attackValue}
                swerve={swerve}
                weaponDamage={weaponDamage}
                targetMookCount={targetMookCount}
                finalDamage={finalDamage}
              />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
