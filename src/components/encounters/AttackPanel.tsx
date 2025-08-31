"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Stack,
  Divider,
  Alert,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useEncounter, useToast } from "@/contexts"
import { CS, DS } from "@/services"
import type { Character, Shot, Weapon } from "@/types"
import { useClient } from "@/contexts/AppContext"
import { NumberField } from "@/components/ui"
import CharacterSelector from "./CharacterSelector"

interface AttackPanelProps {
  onClose?: () => void
}

export default function AttackPanel({ onClose }: AttackPanelProps) {
  const { encounter, weapons: encounterWeapons, ec } = useEncounter()
  const { toastSuccess, toastError } = useToast()
  const { client } = useClient()

  // State for attack form
  const [attackerShotId, setAttackerShotId] = useState<string>("")
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([])
  const [attackSkill, setAttackSkill] = useState<string>("")
  const [attackValue, setAttackValue] = useState<string>("")
  const [defenseValue, setDefenseValue] = useState<string>("0")
  const [toughnessValue, setToughnessValue] = useState<string>("0")
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>("")
  const [weaponDamage, setWeaponDamage] = useState<string>("")
  const [swerve, setSwerve] = useState<string>("")
  const [stunt, setStunt] = useState(false)
  const [finalDamage, setFinalDamage] = useState<string>("")
  const [shotCost, setShotCost] = useState<string>("3")
  const [isProcessing, setIsProcessing] = useState(false)
  const [mookRolls, setMookRolls] = useState<
    Array<{
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
  >([])
  const [showMookRolls, setShowMookRolls] = useState(false)
  const [mookDistribution, setMookDistribution] = useState<{ [targetId: string]: number }>({})
  const [totalAttackingMooks, setTotalAttackingMooks] = useState<number>(0)
  const [multiTargetResults, setMultiTargetResults] = useState<Array<{
    targetId: string
    targetName: string
    defense: number
    toughness: number
    wounds: number
  }>>([])
  const [showMultiTargetResults, setShowMultiTargetResults] = useState(false)
  
  // Per-target defense tracking for multiple target attacks
  type DefenseChoice = 'none' | 'dodge' | 'fortune'
  const [defenseChoicePerTarget, setDefenseChoicePerTarget] = useState<{ 
    [targetId: string]: DefenseChoice 
  }>({})
  const [fortuneDiePerTarget, setFortuneDiePerTarget] = useState<{ 
    [targetId: string]: string 
  }>({})
  const [defenseAppliedPerTarget, setDefenseAppliedPerTarget] = useState<{ 
    [targetId: string]: boolean 
  }>({})
  const [manualDefensePerTarget, setManualDefensePerTarget] = useState<{
    [targetId: string]: string
  }>({})
  const [manualToughnessPerTarget, setManualToughnessPerTarget] = useState<{
    [targetId: string]: string
  }>({})
  
  // For backward compatibility
  const [targetShotId, setTargetShotId] = useState<string>("")

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
      setAttackSkill(mainAttack)

      // Set suggested attack value
      const av = CS.actionValue(attacker, mainAttack)
      setAttackValue(av.toString())

      // Set default weapon and damage
      const weaponIds = attacker.weapon_ids || []
      const charWeapons = weaponIds
        .map(id => encounterWeapons[id])
        .filter((weapon): weapon is Weapon => weapon !== undefined)

      if (charWeapons.length > 0) {
        setSelectedWeaponId(charWeapons[0].id?.toString() || "")
        setWeaponDamage(charWeapons[0].damage.toString())
      } else {
        setSelectedWeaponId("unarmed")
        const damage = CS.damage(attacker) || 7
        setWeaponDamage(damage.toString())
      }

      // Set shot cost based on character type
      if (CS.isBoss(attacker) || CS.isUberBoss(attacker)) {
        setShotCost("2")
      } else {
        setShotCost("3")
      }

      // Set default mook distribution
      if (CS.isMook(attacker)) {
        setMookDistribution({})
      }
    }
  }, [attacker, encounterWeapons, targetShotId])


  // Calculate damage when swerve is entered (only for non-mook attackers)
  useMemo(() => {
    if (attacker && !CS.isMook(attacker)) {
      if (swerve && attackValue && defenseValue) {
        const av = parseInt(attackValue) || 0
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
            if (outcome >= 0) {
              const smackdown = outcome + weaponDmg
              wounds = Math.max(0, smackdown - targetToughness)
            }

            return {
              targetId,
              targetName: targetChar.name,
              defense: targetDefense,
              toughness: targetToughness,
              wounds
            }
          }).filter(r => r !== null) as typeof multiTargetResults

          setMultiTargetResults(results)
          setShowMultiTargetResults(true)
          
          // Set total for display
          const totalWounds = results.reduce((sum, r) => sum + r.wounds, 0)
          setFinalDamage(totalWounds.toString())
        } else {
          // No targets selected
          setMultiTargetResults([])
          setShowMultiTargetResults(false)
          setFinalDamage("0")
        }
      }
    }
  }, [swerve, attackValue, defenseValue, weaponDamage, attacker, selectedTargetIds, allShots])

  // Reset defense choices when targets change
  useEffect(() => {
    setDefenseChoicePerTarget({})
    setFortuneDiePerTarget({})
    setDefenseAppliedPerTarget({})
  }, [selectedTargetIds])

  // Helper function to update defense and toughness based on selected targets
  const updateDefenseAndToughness = (targetIds: string[], includeStunt: boolean = false) => {
    if (targetIds.length === 0) {
      setDefenseValue("0")
      setToughnessValue("0")
      return
    }

    const targets = targetIds.map(id => 
      allShots.find(s => s.character?.shot_id === id)?.character
    ).filter((char): char is Character => char !== undefined)

    if (targetIds.length === 1) {
      // Single target - show actual defense and toughness
      const target = targets[0]
      if (target) {
        let defense = CS.defense(target)
        if (includeStunt) defense += 2  // Add stunt modifier
        setDefenseValue(defense.toString())
        setToughnessValue(CS.toughness(target).toString())
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
        setDefenseValue(highestDefense.toString())
        // No toughness display for multiple targets
        setToughnessValue("0")
      } else {
        // Non-mook attacking multiple targets - highest defense + number of targets
        const defenses = targets.map(t => {
          let defense = CS.defense(t)
          if (includeStunt) defense += 2  // Add stunt modifier to each target
          return defense
        })
        const highestDefense = Math.max(...defenses)
        const combinedDefense = highestDefense + targetIds.length
        setDefenseValue(combinedDefense.toString())
        // No toughness for multiple targets
        setToughnessValue("0")
      }
    }
  }

  // Helper function to distribute mooks among targets
  const distributeMooks = (targetIds: string[]) => {
    if (!attacker || !CS.isMook(attacker)) return
    
    const totalMooks = attacker.count || 0
    const targetCount = targetIds.length
    
    if (targetCount === 0) {
      setMookDistribution({})
      setTotalAttackingMooks(0)
      return
    }
    
    const mooksPerTarget = Math.floor(totalMooks / targetCount)
    const remainder = totalMooks % targetCount
    
    const distribution: { [targetId: string]: number } = {}
    targetIds.forEach((id, index) => {
      distribution[id] = mooksPerTarget + (index < remainder ? 1 : 0)
    })
    
    setMookDistribution(distribution)
    setTotalAttackingMooks(totalMooks)
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

  // Handle defense application for a specific target
  const handleApplyDefenseForTarget = async (targetId: string) => {
    const targetShot = allShots.find(s => s.character?.shot_id === targetId)
    const target = targetShot?.character
    if (!target) return
    
    const choice = defenseChoicePerTarget[targetId]
    if (choice === 'none' || defenseAppliedPerTarget[targetId]) return
    
    setIsProcessing(true)
    try {
      // Spend 1 shot for dodge or fortune
      await ec.spendShots(target, 1)
      
      if (choice === 'fortune') {
        // TODO: Also deduct fortune point when fortune point tracking is implemented
        const fortuneRoll = fortuneDiePerTarget[targetId] || "0"
        toastSuccess(`Fortune dodge applied to ${target.name}! (+3 +${fortuneRoll} DV, -1 shot, -1 fortune)`)
      } else {
        toastSuccess(`Dodge applied to ${target.name}! (+3 DV, -1 shot)`)
      }
      
      setDefenseAppliedPerTarget(prev => ({ ...prev, [targetId]: true }))
      
      // Recalculate wounds for this target with new defense
      const newDefense = calculateTargetDefense(target, targetId)
      const smackdown = parseInt(attackValue || "0") + parseInt(swerve || "0") - parseInt(defenseValue || "0") + parseInt(weaponDamage || "0")
      const newWounds = Math.max(0, smackdown - CS.toughness(target))
      
      // Update the multi-target results
      setMultiTargetResults(prev => prev.map(result => 
        result.targetId === targetId 
          ? { ...result, defense: newDefense, wounds: newWounds }
          : result
      ))
    } catch (error) {
      console.error("Defense application error:", error)
      toastError(`Failed to apply defense for ${target.name}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset when attacker changes
  useEffect(() => {
    setMookRolls([])
    setShowMookRolls(false)
    setSelectedTargetIds([])
    setMookDistribution({})
    setDefenseValue("0")
    setToughnessValue("0")
    setSwerve("")  // Reset to empty, not 0
    setFinalDamage("")  // Reset to empty, not 0
    // Reset per-target defense states
    setDefenseChoicePerTarget({})
    setFortuneDiePerTarget({})
    setDefenseAppliedPerTarget({})
    setManualDefensePerTarget({})
    setManualToughnessPerTarget({})
    // Initialize total attacking mooks for mook attackers
    const currentAttacker = allShots.find(s => s.character?.shot_id === attackerShotId)?.character
    if (currentAttacker && CS.isMook(currentAttacker)) {
      setTotalAttackingMooks(currentAttacker.count || 0)
    } else {
      setTotalAttackingMooks(0)
    }
  }, [attackerShotId, allShots])

  const handleRollMookAttacks = () => {
    if (!attacker || !CS.isMook(attacker)) return

    const av = parseInt(attackValue) || 0
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
            // Calculate smackdown and wounds for this hit
            const smackdown = outcome + weaponDmg
            wounds = Math.max(0, smackdown - targetToughness)
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
          const smackdown = outcome + weaponDmg
          wounds = Math.max(0, smackdown - toughness)
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

    setMookRolls(allTargetRolls)
    setShowMookRolls(true)
    setFinalDamage(grandTotalWounds.toString())
  }


  const handleApplyDamage = async () => {
    // Handle multiple targets for non-mook attackers
    if (!CS.isMook(attacker) && selectedTargetIds.length > 1 && multiTargetResults.length > 0) {
      setIsProcessing(true)
      try {
        const shots = parseInt(shotCost) || 3
        
        // Spend shots for the attacker
        await ec.spendShots(attacker, shots)
        
        // Apply wounds to each target
        for (const result of multiTargetResults) {
          const targetShot = allShots.find(s => s.character?.shot_id === result.targetId)
          const targetChar = targetShot?.character
          if (!targetChar) continue
          
          // Calculate effective wounds considering defense choices
          const smackdown = parseInt(attackValue || "0") + parseInt(swerve || "0") - parseInt(defenseValue || "0") + parseInt(weaponDamage || "0")
          const effectiveWounds = defenseAppliedPerTarget[result.targetId] 
            ? Math.max(0, smackdown - CS.toughness(targetChar))
            : result.wounds
          
          if (effectiveWounds === 0) continue // Skip targets with no wounds
          
          const isPC = CS.isPC(targetChar)
          const currentWounds = CS.wounds(targetChar)
          const newWounds = currentWounds + effectiveWounds
          
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
          
          // Send update to backend for this target
          await client.updateCombatState(
            encounter,
            targetChar.shot_id || "",
            isPC ? newWounds : undefined,
            !isPC ? newWounds : undefined,
            newImpairments,
            {
              type: "attack",
              description: `${attacker.name} attacked ${targetChar.name}${defenseDesc} for ${effectiveWounds} wounds`,
              details: {
                attacker_id: attackerShot.character?.id,
                target_id: targetChar.id,
                damage: effectiveWounds,
                attack_value: parseInt(attackValue),
                defense_value: parseInt(defenseValue),
                effective_defense: calculateTargetDefense(targetChar, result.targetId),
                swerve: parseInt(swerve),
                outcome: parseInt(attackValue) + parseInt(swerve) - parseInt(defenseValue),
                weapon_damage: parseInt(weaponDamage),
                shot_cost: shots,
                stunt: stunt,
                dodge: defenseChoice !== 'none',
                defense_choice: defenseChoice,
                fortune_die: defenseChoice === 'fortune' ? parseInt(fortuneDiePerTarget[result.targetId] || "0") : undefined,
              },
            }
          )
          
          toastSuccess(
            `Applied ${effectiveWounds} wound${effectiveWounds !== 1 ? "s" : ""} to ${targetChar.name}${defenseDesc}`
          )
        }
        
        // Reset form
        setSelectedTargetIds([])
        setMultiTargetResults([])
        setShowMultiTargetResults(false)
        setSwerve("")
        setFinalDamage("")
        setDodge(false)
        setStunt(false)
        setDefenseChoicePerTarget({})
        setFortuneDiePerTarget({})
        setDefenseAppliedPerTarget({})
        
        if (onClose) {
          onClose()
        }
        return
      } catch (error) {
        toastError("Failed to apply damage")
      } finally {
        setIsProcessing(false)
      }
    }
    
    // Handle multiple targets for mook attackers
    if (CS.isMook(attacker) && selectedTargetIds.length > 1 && mookRolls.length > 0) {
      setIsProcessing(true)
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
                attack_value: parseInt(attackValue),
                defense_value: CS.defense(targetChar),
                weapon_damage: parseInt(weaponDamage),
                shot_cost: shots,
                is_mook_attack: true,
                mook_count: targetGroup.rolls.length,
                mook_hits: targetGroup.rolls.filter(r => r.hit).length,
              },
            }
          )
          
          toastSuccess(
            `Applied ${totalWounds} wound${totalWounds !== 1 ? "s" : ""} to ${targetChar.name}`
          )
        }
        
        // Reset form
        setSelectedTargetIds([])
        setMookDistribution({})
        setTotalAttackingMooks(0)
        setMookRolls([])
        setShowMookRolls(false)
        setSwerve("")
        setFinalDamage("")
        setDodge(false)
        setStunt(false)
        setDefenseChoicePerTarget({})
        setFortuneDiePerTarget({})
        setDefenseAppliedPerTarget({})
        
        if (onClose) {
          onClose()
        }
        return
      } catch (error) {
        toastError("Failed to apply damage")
      } finally {
        setIsProcessing(false)
      }
    }
    
    // Original single-target logic
    if (!target || !targetShot || !finalDamage || !attacker || !attackerShot)
      return

    setIsProcessing(true)
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
        // Regular attack - apply damage using CharacterService
        const currentWounds = CS.wounds(targetChar)
        const toughness = parseInt(toughnessValue) || 0
        actualWoundsDealt = CS.calculateWounds(targetChar, damage, toughness)
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
            dodge: dodge,
            is_mook_attack: CS.isMook(attacker),
            mook_count: CS.isMook(attacker) ? attacker.count : undefined,
            mook_hits:
              mookRolls.length > 0
                ? mookRolls.filter(r => r.hit).length
                : undefined,
          },
        }
      )

      toastSuccess(
        `Applied ${actualWoundsDealt} wound${actualWoundsDealt !== 1 ? "s" : ""} to ${target.name}`
      )

      // Reset form
      setTargetShotId("")
      setSwerve("")
      setFinalDamage("")
      setDodge(false)
      setStunt(false)
      setMookRolls([])
      setShowMookRolls(false)
      // Reset targets
      setSelectedTargetIds([])
      setTargetShotId("")
      setMookDistribution({})
      setTotalAttackingMooks(0)
      setDefenseChoicePerTarget({})
      setFortuneDiePerTarget({})
      setDefenseAppliedPerTarget({})

      if (onClose) {
        onClose()
      }
    } catch (error) {
      toastError("Failed to apply damage")
      console.error(error)
    } finally {
      setIsProcessing(false)
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
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: "2px solid",
              borderBottomColor: "divider",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>
              ⚔️ Attacker
            </Typography>

            {/* Avatar Selection and Shot Cost on same line */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="flex-start"
              sx={{ mb: 3 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <CharacterSelector
                  shots={sortedAttackerShots}
                  selectedShotId={attackerShotId}
                  onSelect={setAttackerShotId}
                  borderColor="primary.main"
                  // No filtering for attacker selector - shows all characters
                />
              </Box>

              {/* Shot Cost */}
              <Box sx={{ flexShrink: 0 }}>
                <Typography
                  variant="caption"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Shot Cost
                </Typography>
                <NumberField
                  name="shotCost"
                  value={parseInt(shotCost) || 0}
                  size="small"
                  width="80px"
                  error={false}
                  onChange={e => setShotCost(e.target.value)}
                  onBlur={e => setShotCost(e.target.value)}
                />
              </Box>
            </Stack>

            {/* Attack Skill and Weapon Selection */}
            {attacker && "action_values" in attacker && (
              <>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 2, sm: 2 }}
                  sx={{ mb: 3 }}
                >
                  {/* Attack Skill Block */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, fontWeight: "medium" }}
                    >
                      Attack Skill
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <NumberField
                        name="attackValue"
                        value={parseInt(attackValue) || 0}
                        size="small"
                        width="80px"
                        error={false}
                        onChange={e => setAttackValue(e.target.value)}
                        onBlur={e => setAttackValue(e.target.value)}
                      />
                      {(() => {
                        const mainAttack = CS.mainAttack(attacker)
                        const mainValue = CS.actionValue(attacker, mainAttack)
                        const secondaryAttack = CS.secondaryAttack(attacker)
                        const secondaryValue = secondaryAttack
                          ? CS.actionValue(attacker, secondaryAttack)
                          : 0

                        const attackOptions = [
                          { skill: mainAttack, value: mainValue },
                          ...(secondaryAttack
                            ? [
                                {
                                  skill: secondaryAttack,
                                  value: secondaryValue,
                                },
                              ]
                            : []),
                        ]

                        return (
                          <FormControl
                            sx={{
                              flex: 1,
                              "& .MuiInputBase-root": { height: 56 },
                            }}
                          >
                            <InputLabel>Attack Skill</InputLabel>
                            <Select
                              value={attackSkill}
                              onChange={e => {
                                const selected = e.target.value
                                setAttackSkill(selected)
                                const option = attackOptions.find(
                                  o => o.skill === selected
                                )
                                if (option) {
                                  setAttackValue(option.value.toString())
                                }
                              }}
                              label="Attack Skill"
                            >
                              {attackOptions.map(option => (
                                <MenuItem
                                  key={option.skill}
                                  value={option.skill}
                                >
                                  {option.skill} ({option.value})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )
                      })()}
                    </Stack>
                  </Box>

                  {/* Damage and Weapon Block */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, fontWeight: "medium" }}
                    >
                      Damage
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <NumberField
                        name="weaponDamage"
                        value={parseInt(weaponDamage) || 0}
                        size="small"
                        width="80px"
                        error={false}
                        onChange={e => setWeaponDamage(e.target.value)}
                        onBlur={e => setWeaponDamage(e.target.value)}
                      />
                      <FormControl
                        sx={{ flex: 1, "& .MuiInputBase-root": { height: 56 } }}
                      >
                        <InputLabel>Weapon</InputLabel>
                        <Select
                          value={selectedWeaponId}
                          onChange={e => {
                            setSelectedWeaponId(e.target.value)
                            if (e.target.value === "unarmed") {
                              const damage = CS.damage(attacker) || 7
                              setWeaponDamage(damage.toString())
                            } else {
                              const weapon = attackerWeapons.find(
                                w => w.id?.toString() === e.target.value
                              )
                              if (weapon) {
                                setWeaponDamage(weapon.damage.toString())
                              }
                            }
                          }}
                          label="Weapon"
                        >
                          <MenuItem value="unarmed">
                            Damage ({CS.damage(attacker) || 7})
                          </MenuItem>
                          {attackerWeapons.map(weapon => (
                            <MenuItem
                              key={weapon.id}
                              value={weapon.id?.toString() || ""}
                            >
                              {weapon.name} (Damage: {weapon.damage})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Box>
                </Stack>

              </>
            )}
          </Box>

          {/* Target Section */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: "2px solid",
              borderBottomColor: "divider",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mb: 2, color: "error.main" }}
            >
              🎯 Target{selectedTargetIds.length > 1 ? "s" : ""} {selectedTargetIds.length > 0 && `(${selectedTargetIds.length})`}
            </Typography>

            {/* Multi-select Target Selection */}
            <CharacterSelector
              shots={sortedTargetShots}
              selectedShotIds={selectedTargetIds}
              onSelect={(shotId) => {
                if (selectedTargetIds.includes(shotId)) {
                  // Deselect if already selected
                  const newIds = selectedTargetIds.filter(id => id !== shotId)
                  setSelectedTargetIds(newIds)
                  
                  // Update defense/toughness based on remaining targets
                  if (newIds.length === 0) {
                    setDefenseValue("0")
                    setToughnessValue("0")
                  } else {
                    updateDefenseAndToughness(newIds, stunt)
                  }
                  
                  // Update mook distribution
                  if (CS.isMook(attacker)) {
                    distributeMooks(newIds)
                  }
                } else {
                  // Add to selection
                  const newIds = [...selectedTargetIds, shotId]
                  setSelectedTargetIds(newIds)
                  updateDefenseAndToughness(newIds, stunt)
                  
                  // Update mook distribution
                  if (CS.isMook(attacker)) {
                    distributeMooks(newIds)
                  }
                }
              }}
              borderColor="error.main"
              disabled={!attackerShotId}
              showAllCheckbox={true}
              excludeShotId={attackerShotId}
              multiSelect={true}
              characterTypes={(() => {
                if (!attacker) return undefined
                
                // Check if any selected targets are mooks or non-mooks
                const hasSelectedMooks = selectedTargetIds.some(id => {
                  const shot = allShots.find(s => s.character?.shot_id === id)
                  return shot?.character && CS.isMook(shot.character)
                })
                const hasSelectedNonMooks = selectedTargetIds.some(id => {
                  const shot = allShots.find(s => s.character?.shot_id === id)
                  return shot?.character && !CS.isMook(shot.character)
                })
                
                // If a mook is selected, only show other mooks
                if (hasSelectedMooks) {
                  return ["Mook"]
                }
                
                // If a non-mook is selected, exclude mooks
                if (hasSelectedNonMooks) {
                  if (CS.isPC(attacker) || CS.isAlly(attacker)) {
                    return ["Featured Foe", "Boss", "Uber-Boss"]
                  }
                  if (
                    CS.isMook(attacker) ||
                    CS.isFeaturedFoe(attacker) ||
                    CS.isBoss(attacker) ||
                    CS.isUberBoss(attacker)
                  ) {
                    return ["PC", "Ally"]
                  }
                }
                
                // No targets selected yet, show based on attacker type
                if (CS.isPC(attacker) || CS.isAlly(attacker)) {
                  return ["Mook", "Featured Foe", "Boss", "Uber-Boss"]
                }
                if (
                  CS.isMook(attacker) ||
                  CS.isFeaturedFoe(attacker) ||
                  CS.isBoss(attacker) ||
                  CS.isUberBoss(attacker)
                ) {
                  return ["PC", "Ally"]
                }
                return undefined
              })()}
            />

            {/* Mook Distribution Display */}
            {CS.isMook(attacker) && selectedTargetIds.length > 0 && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: "medium" }}>
                  Mook Distribution ({totalAttackingMooks} total)
                </Typography>
                <Stack spacing={1}>
                  {selectedTargetIds.map(id => {
                    const shot = allShots.find(s => s.character?.shot_id === id)
                    const char = shot?.character
                    if (!char) return null
                    
                    return (
                      <Box 
                        key={id} 
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 2,
                          backgroundColor: "background.paper",
                          p: 1,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider"
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                          <NumberField
                            name={`mookDist-${id}`}
                            value={mookDistribution[id] || 0}
                            size="small"
                            width="80px"
                            error={false}
                            onChange={e => {
                              const newValue = parseInt(e.target.value) || 0
                              const newDistribution = {
                                ...mookDistribution,
                                [id]: newValue
                              }
                              setMookDistribution(newDistribution)
                              // Update total
                              const newTotal = Object.values(newDistribution).reduce((sum, val) => sum + val, 0)
                              setTotalAttackingMooks(newTotal)
                            }}
                            onBlur={e => {
                              const newValue = parseInt(e.target.value) || 0
                              const newDistribution = {
                                ...mookDistribution,
                                [id]: newValue
                              }
                              setMookDistribution(newDistribution)
                              // Update total
                              const newTotal = Object.values(newDistribution).reduce((sum, val) => sum + val, 0)
                              setTotalAttackingMooks(newTotal)
                            }}
                          />
                          <Typography variant="caption" sx={{ mt: 0.5 }}>
                            mooks
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: "medium"
                          }}
                        >
                          {char.name}
                        </Typography>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            )}

            {/* Target Defense Display for Non-Mook Attackers */}
            {!CS.isMook(attacker) && selectedTargetIds.length > 0 && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Stack spacing={1}>
                  {selectedTargetIds.map(id => {
                    const shot = allShots.find(s => s.character?.shot_id === id)
                    const char = shot?.character
                    if (!char) return null
                    
                    const baseDefense = CS.defense(char)
                    const currentDefense = calculateTargetDefense(char, id)
                    const baseToughness = CS.toughness(char)
                    const currentToughness = manualToughnessPerTarget[id] ? parseInt(manualToughnessPerTarget[id]) : baseToughness
                    
                    return (
                      <Box 
                        key={id} 
                        sx={{ 
                          display: "flex", 
                          flexDirection: { xs: "column", sm: "row" },
                          alignItems: { xs: "stretch", sm: "center" }, 
                          gap: { xs: 1, sm: 2 },
                          backgroundColor: "background.paper",
                          p: 1,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider"
                        }}
                      >
                        {/* Name at the top for mobile */}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: "medium",
                            display: { xs: "block", sm: "none" },
                            mb: 1
                          }}
                        >
                          {char.name}
                        </Typography>
                        
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
                            <NumberField
                              name={`defense-${id}`}
                              value={manualDefensePerTarget[id] || currentDefense}
                              size="small"
                              width="80px"
                              error={false}
                              disabled={false}
                              onChange={(e) => {
                                setManualDefensePerTarget(prev => ({
                                  ...prev,
                                  [id]: e.target.value
                                }))
                                // Recalculate combined defense for multiple targets
                                if (selectedTargetIds.length > 1) {
                                  const updatedDefenses = selectedTargetIds.map(targetId => {
                                    if (targetId === id) {
                                      return parseInt(e.target.value) || 0
                                    }
                                    const targetShot = allShots.find(s => s.character?.shot_id === targetId)
                                    const targetChar = targetShot?.character
                                    if (!targetChar) return 0
                                    return manualDefensePerTarget[targetId] 
                                      ? parseInt(manualDefensePerTarget[targetId]) 
                                      : calculateTargetDefense(targetChar, targetId)
                                  })
                                  const highestDefense = Math.max(...updatedDefenses)
                                  const combinedDefense = highestDefense + selectedTargetIds.length
                                  setDefenseValue(combinedDefense.toString())
                                } else {
                                  // For single target, just update the defense value directly
                                  setDefenseValue(e.target.value)
                                }
                              }}
                              onBlur={(e) => {
                                setManualDefensePerTarget(prev => ({
                                  ...prev,
                                  [id]: e.target.value
                                }))
                              }}
                            />
                            <Typography variant="caption" sx={{ mt: 0.5 }}>
                              Defense
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
                            <NumberField
                              name={`toughness-${id}`}
                              value={manualToughnessPerTarget[id] || currentToughness}
                              size="small"
                              width="80px"
                              error={false}
                              disabled={false}
                              onChange={(e) => {
                                setManualToughnessPerTarget(prev => ({
                                  ...prev,
                                  [id]: e.target.value
                                }))
                              }}
                              onBlur={(e) => {
                                setManualToughnessPerTarget(prev => ({
                                  ...prev,
                                  [id]: e.target.value
                                }))
                              }}
                            />
                            <Typography variant="caption" sx={{ mt: 0.5 }}>
                              Toughness
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Name on the side for desktop */}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: "medium",
                            flex: 1,
                            display: { xs: "none", sm: "block" }
                          }}
                        >
                          {char.name}
                        </Typography>
                        
                        {/* Dodge button */}
                        {!defenseAppliedPerTarget[id] && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              // Open a dialog or toggle inline options for dodge
                              if (defenseChoicePerTarget[id] === 'dodge') {
                                // Apply regular dodge
                                handleApplyDefenseForTarget(id)
                              } else {
                                // Set to dodge choice
                                setDefenseChoicePerTarget(prev => ({
                                  ...prev,
                                  [id]: 'dodge' as DefenseChoice
                                }))
                                // Auto-apply regular dodge
                                handleApplyDefenseForTarget(id)
                              }
                            }}
                            sx={{ minWidth: "80px" }}
                          >
                            Dodge
                          </Button>
                        )}
                        
                        {defenseAppliedPerTarget[id] && (
                          <Typography variant="body2" sx={{ color: 'success.main' }}>
                            ✓ Dodged
                          </Typography>
                        )}
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            )}

            {/* Defense Value - show for multiple targets */}
            {selectedTargetIds.length > 1 && (
              <Box sx={{ mb: 3, mt: 2 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, fontWeight: "medium" }}
                    >
                      Defense
                    </Typography>
                    <NumberField
                      name="defenseValue"
                      value={parseInt(defenseValue || "0") || 0}
                      size="small"
                      width="80px"
                      error={false}
                      disabled={attacker && CS.isMook(attacker)}
                      onChange={e => setDefenseValue(e.target.value)}
                      onBlur={e => setDefenseValue(e.target.value)}
                    />
                    {selectedTargetIds.length > 1 && (
                      <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                        {attacker && CS.isMook(attacker) 
                          ? "(Highest shown for reference)" 
                          : `(Highest + ${selectedTargetIds.length})`}
                      </Typography>
                    )}
                    {(() => {
                      let total = 0
                      if (stunt) total += 2
                      return total > 0 ? (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            minHeight: "20px",
                            textAlign: "center",
                          }}
                        >
                          +{total}
                        </Typography>
                      ) : (
                        <Box sx={{ minHeight: "20px", mt: 0.5 }} />
                      )
                    })()}
                  </Box>

                </Stack>
              </Box>
            )}

            {/* Defense Modifiers */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "medium" }}>
                Defense Modifiers
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={stunt}
                      onChange={e => {
                        const newStunt = e.target.checked
                        setStunt(newStunt)
                        // Clear manual defense overrides when stunt changes so calculateTargetDefense takes over
                        setManualDefensePerTarget({})
                        // Recalculate defense with stunt modifier
                        if (selectedTargetIds.length > 0) {
                          updateDefenseAndToughness(selectedTargetIds, newStunt)
                        }
                      }}
                      disabled={!target && selectedTargetIds.length === 0}
                    />
                  }
                  label="Stunt (+2 DV)"
                />
              </Stack>
            </Box>
          </Box>
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
            <>
              {/* Mook Attack Resolution */}
              <Stack spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ textAlign: "center" }}>
                  {totalAttackingMooks || attacker.count || 0} mooks
                  attacking
                </Typography>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleRollMookAttacks}
                  disabled={(!target && selectedTargetIds.length === 0) || !attackValue}
                  sx={{ mb: 2 }}
                >
                  Roll Mook Attacks
                </Button>

                {showMookRolls && mookRolls.length > 0 && (
                  <Box
                    sx={{
                      width: "100%",
                      maxHeight: 400,
                      overflowY: "auto",
                      mb: 2,
                    }}
                  >
                    <Stack spacing={2}>
                      {mookRolls.map((targetGroup, groupIndex) => {
                        const targetShot = allShots.find(s => s.character?.shot_id === targetGroup.targetId)
                        const targetChar = targetShot?.character
                        const targetDefense = targetChar ? CS.defense(targetChar) : 0
                        const targetToughness = targetChar ? CS.toughness(targetChar) : 0
                        const hits = targetGroup.rolls.filter(r => r.hit).length
                        const totalWounds = targetGroup.rolls.reduce((sum, r) => sum + r.wounds, 0)
                        
                        return (
                          <Alert key={groupIndex} severity="info" sx={{ pb: 1 }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                              Attacking {targetGroup.targetName} 
                              ({targetGroup.rolls.length} mooks, DV {targetDefense}, Toughness {targetToughness})
                            </Typography>
                            <Box sx={{ maxHeight: '120px', overflowY: 'auto', mb: 1 }}>
                              <Stack spacing={0.5}>
                                {targetGroup.rolls.map((roll, index) => (
                                  <Typography
                                    key={index}
                                    variant="caption"
                                    sx={{ display: "block" }}
                                  >
                                    Mook {roll.mookNumber}: AV {attackValue} + Swerve{" "}
                                    {roll.swerve} = {roll.actionResult} vs DV{" "}
                                    {targetDefense} ={" "}
                                    {roll.hit ? (
                                      <span style={{ color: "#4caf50" }}>
                                        Hit! ({roll.wounds} wounds)
                                      </span>
                                    ) : (
                                      <span style={{ color: "#f44336" }}>Miss</span>
                                    )}
                                  </Typography>
                                ))}
                              </Stack>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2">
                              <strong>
                                {targetGroup.targetName}: {hits}/{targetGroup.rolls.length} hits, {totalWounds} wounds total
                              </strong>
                            </Typography>
                          </Alert>
                        )
                      })}
                      
                      {/* Per-Target Wounds Summary */}
                      {mookRolls.length > 0 && (
                        <Alert severity="warning" sx={{ position: 'sticky', bottom: 0, zIndex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Wounds to Apply:
                          </Typography>
                          <Stack spacing={0.5}>
                            {mookRolls.map((targetGroup) => {
                              const totalWounds = targetGroup.rolls.reduce((sum, r) => sum + r.wounds, 0)
                              return (
                                <Typography key={targetGroup.targetId} variant="body2">
                                  <strong>{targetGroup.targetName}:</strong> {totalWounds} wounds
                                </Typography>
                              )
                            })}
                          </Stack>
                        </Alert>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Final Damage and Apply Button */}
                {/* Hide Total Wounds field when mooks attack multiple targets */}
                {selectedTargetIds.length <= 1 ? (
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" sx={{ mb: 0.5 }}>
                        Total Wounds
                      </Typography>
                      <NumberField
                        name="finalDamage"
                        value={parseInt(finalDamage) || 0}
                        size="large"
                        width="120px"
                        error={false}
                        onChange={e => setFinalDamage(e.target.value)}
                        onBlur={e => setFinalDamage(e.target.value)}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleApplyDamage}
                        disabled={!target || !finalDamage || isProcessing}
                        size="large"
                        startIcon={<CheckCircleIcon />}
                        sx={{ height: 56, px: 3 }}
                      >
                        Apply Wounds
                      </Button>
                      {finalDamage && shotCost && (
                        <Typography
                          variant="caption"
                          sx={{ mt: 0.5, textAlign: "center" }}
                        >
                          Apply {finalDamage} wounds, spend {shotCost} shots
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                ) : (
                  /* For multiple targets, show apply button without total field */
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleApplyDamage}
                      disabled={selectedTargetIds.length === 0 || !showMookRolls || isProcessing}
                      size="large"
                      startIcon={<CheckCircleIcon />}
                      sx={{ px: 3 }}
                    >
                      Apply Wounds
                    </Button>
                    {shotCost && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 1, display: "block", textAlign: "center" }}
                      >
                        Spend {shotCost} shots
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            </>
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
                    onChange={e => setSwerve(e.target.value)}
                    onBlur={e => {
                      const val = e.target.value
                      if (val === "" || val === "-") {
                        setSwerve("0")
                      } else {
                        setSwerve(val)
                      }
                    }}
                  />
                </Box>

                {/* Final Damage Override - Hide when using multi-target display */}
                {selectedTargetIds.length === 0 && (
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
                      onChange={e => setFinalDamage(e.target.value)}
                      onBlur={e => setFinalDamage(e.target.value)}
                    />
                  </Box>
                )}

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
                        ? `Apply wounds to ${multiTargetResults.length} targets, spend ${shotCost} shots`
                        : parseInt(finalDamage) > 0
                        ? `Apply ${finalDamage} wounds, spend ${shotCost} shots`
                        : `Spend ${shotCost} shots`}
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
                const outcome = parseInt(attackValue || "0") + parseInt(swerve || "0") - parseInt(defenseValue || "0")
                const isHit = outcome >= 0
                const defenseLabel = selectedTargetIds.length === 1 ? "Defense" : "Combined Defense"
                return (
                  <Alert severity={isHit ? "success" : "error"} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                      {isHit ? "Hit!" : "Miss!"} Attack Value {attackValue} + Swerve {swerve} = Action Result {parseInt(attackValue || "0") + parseInt(swerve || "0")}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
                      Action Result {parseInt(attackValue || "0") + parseInt(swerve || "0")} - {defenseLabel} {defenseValue} = Outcome {outcome}
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
                  
                  // If this target has dodge/fortune applied, recalculate their individual wounds
                  let effectiveWounds = result.wounds
                  if (hasDefenseModifier && selectedTargetIds.length > 1) {
                    // For multiple targets with dodge, recalculate outcome for this specific target
                    const individualOutcome = parseInt(attackValue || "0") + parseInt(swerve || "0") - currentDefense
                    if (individualOutcome >= 0) {
                      const individualSmackdown = individualOutcome + parseInt(weaponDamage || "0")
                      effectiveWounds = Math.max(0, individualSmackdown - CS.toughness(targetChar))
                    } else {
                      effectiveWounds = 0
                    }
                  } else if (selectedTargetIds.length === 1) {
                    // For single target, wounds are already calculated correctly
                    effectiveWounds = result.wounds
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
                      <Typography variant="body2">
                        Toughness: {result.toughness}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold", mt: 1 }}>
                        Smackdown {smackdown} - Toughness {result.toughness} = <strong>{effectiveWounds} wounds</strong>
                      </Typography>
                    </Alert>
                  )
                })}
              </Stack>

              {/* Summary of wounds to apply */}
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  Wounds to Apply:
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  {multiTargetResults.map((result) => {
                    const targetShot = allShots.find(s => s.character?.shot_id === result.targetId)
                    const targetChar = targetShot?.character
                    if (!targetChar) return null
                    
                    const currentDefense = calculateTargetDefense(targetChar, result.targetId)
                    const hasDefenseModifier = defenseChoicePerTarget[result.targetId] && defenseChoicePerTarget[result.targetId] !== 'none'
                    
                    // Use same logic as in individual results
                    let effectiveWounds = result.wounds
                    if (hasDefenseModifier && selectedTargetIds.length > 1) {
                      const individualOutcome = parseInt(attackValue || "0") + parseInt(swerve || "0") - currentDefense
                      if (individualOutcome >= 0) {
                        const individualSmackdown = individualOutcome + parseInt(weaponDamage || "0")
                        effectiveWounds = Math.max(0, individualSmackdown - CS.toughness(targetChar))
                      } else {
                        effectiveWounds = 0
                      }
                    }
                    
                    return (
                      <Typography key={result.targetId} variant="body2">
                        <strong>{result.targetName}:</strong> {effectiveWounds} wounds
                        {defenseChoicePerTarget[result.targetId] === 'dodge' && ` (dodged)`}
                        {defenseChoicePerTarget[result.targetId] === 'fortune' && ` (fortune dodge)`}
                      </Typography>
                    )
                  })}
                </Stack>
              </Alert>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
