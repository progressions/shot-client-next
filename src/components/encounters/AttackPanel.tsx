"use client"

import { useMemo, useEffect } from "react"
import { Box, Card, CardContent, Typography } from "@mui/material"
import { useEncounter, useToast } from "@/contexts"
import { CS, DS } from "@/services"
import type {
  Character,
  Shot,
  Weapon,
  AttackFormData,
  AttackPanelProps,
} from "@/types"
import { useClient } from "@/contexts/AppContext"
import AttackerSection from "./attacks/AttackerSection"
import TargetSection from "./attacks/TargetSection"
import WoundsSummary from "./attacks/WoundsSummary"
import MookAttackSection from "./attacks/MookAttackSection"
import CombatResolution from "./attacks/CombatResolution"
import AttackResults from "./attacks/AttackResults"
import { useForm } from "@/reducers"
import {
  calculateTargetDefense as calcTargetDefense,
  distributeMooksAmongTargets,
} from "./attacks/attackCalculations"
import {
  sortAttackerShots,
  sortTargetShots,
  getAllVisibleShots,
} from "./attacks/shotSorting"
import { createFieldUpdater, createFieldsUpdater } from "./attacks/formHelpers"

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
    targetMookCountPerTarget: {},

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
    targetMookCountPerTarget,
    defenseChoicePerTarget,
    fortuneDiePerTarget,
    defenseAppliedPerTarget,
    manualDefensePerTarget,
    manualToughnessPerTarget,
    targetShotId,
  } = formState.data

  // Create form update helpers
  const updateField = createFieldUpdater<AttackFormData>(dispatchForm)
  const updateFields = createFieldsUpdater<AttackFormData>(dispatchForm)

  // Helper function to calculate effective attack value
  // Note: Mook bonus is already included in the attack value from the UI
  const calculateEffectiveAttackValue = (
    attackerChar: Character | undefined,
    weapons: Weapon[],
    allShotsList: Shot[]
  ): number => {
    let baseAttack = parseInt(attackValue) || 0

    // Note: We no longer add weapon mook bonus here since it's already
    // included in the attack value when the weapon is selected in the UI

    // Apply attacker's impairment (already shown in UI but needs to be applied for calculation)
    if (attackerChar && attackerChar.impairments > 0) {
      baseAttack -= attackerChar.impairments
    }

    return baseAttack
  }

  // Get all characters in the fight (excluding hidden ones)
  const allShots = useMemo(
    () => getAllVisibleShots(encounter.shots),
    [encounter.shots]
  )

  // Sort attacker shots by: shot position (higher first), character type priority, then speed
  const sortedAttackerShots = useMemo(
    () => sortAttackerShots(allShots),
    [allShots]
  )

  // Get selected attacker and targets
  const attackerShot = allShots.find(
    s => s.character?.shot_id === attackerShotId
  )
  const attacker = attackerShot?.character

  // Get all selected targets
  const selectedTargets = selectedTargetIds
    .map(id => allShots.find(s => s.character?.shot_id === id)?.character)
    .filter((char): char is Character => char !== undefined)

  // For backward compatibility
  const target = selectedTargets[0]
  const targetShot = selectedTargetIds[0]
    ? allShots.find(s => s.character?.shot_id === selectedTargetIds[0])
    : undefined

  // Sort targets based on attacker type
  const sortedTargetShots = useMemo(
    () => sortTargetShots(allShots, attacker),
    [allShots, attacker]
  )

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
      }

      if (charWeapons.length > 0) {
        const firstWeapon = charWeapons[0]
        updates.selectedWeaponId = firstWeapon.id?.toString() || ""
        updates.weaponDamage = firstWeapon.damage.toString()
        // Don't add mook bonus here - it will be added when mook targets are selected
      } else {
        updates.selectedWeaponId = "unarmed"
        updates.weaponDamage = (CS.damage(attacker) || 7).toString()
      }

      updates.attackValue = av.toString()

      // Set shot cost based on character type
      updates.shotCost =
        CS.isBoss(attacker) || CS.isUberBoss(attacker) ? "2" : "3"

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
        const av = calculateEffectiveAttackValue(
          attacker,
          attackerWeapons,
          allShots
        )
        const dv = parseInt(defenseValue) || 0
        const sw = parseInt(swerve) || 0
        const weaponDmg = parseInt(weaponDamage) || 0

        const outcome = av - dv + sw

        // Handle all targets the same way (single or multiple)
        if (selectedTargetIds.length > 0) {
          const results = selectedTargetIds
            .map(targetId => {
              const targetShot = allShots.find(
                s => s.character?.shot_id === targetId
              )
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
                  // Use per-target mook count if available, otherwise fall back to single count
                  wounds =
                    targetMookCountPerTarget[targetId] || targetMookCount || 1
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
                wounds,
              }
            })
            .filter(r => r !== null) as typeof multiTargetResults

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
              wounds: results[0].wounds,
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
  }, [
    swerve,
    attackValue,
    defenseValue,
    weaponDamage,
    attacker,
    selectedTargetIds,
    allShots,
    targetMookCount,
  ])

  // Reset defense choices when targets change
  useEffect(() => {
    updateFields({
      defenseChoicePerTarget: {},
      fortuneDiePerTarget: {},
      defenseAppliedPerTarget: {},
    })
  }, [selectedTargetIds])

  // Helper function to update defense and toughness based on selected targets
  const updateDefenseAndToughness = (
    targetIds: string[],
    includeStunt: boolean = false
  ) => {
    if (targetIds.length === 0) {
      updateFields({
        defenseValue: "0",
        toughnessValue: "0",
        manualDefensePerTarget: {}, // Clear manual overrides
      })
      return
    }

    const targets = targetIds
      .map(id => allShots.find(s => s.character?.shot_id === id)?.character)
      .filter((char): char is Character => char !== undefined)

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

        if (includeStunt) defense += 2 // Add stunt modifier

        // Update both the main defense value and clear any manual override for this target
        updateFields({
          defenseValue: defense.toString(),
          toughnessValue: CS.toughness(target).toString(),
          manualDefensePerTarget: {
            ...manualDefensePerTarget,
            [targetId]: defense.toString(), // Set the calculated value as the manual override
          },
        })
      }
    } else {
      // Multiple targets
      if (attacker && CS.isMook(attacker)) {
        // Mooks attacking multiple targets - no defense modifier, just show highest for reference
        const defenses = targets.map(t => {
          let defense = CS.defense(t)
          if (includeStunt) defense += 2 // Add stunt modifier to each target
          return defense
        })
        const highestDefense = Math.max(...defenses)
        updateFields({
          defenseValue: highestDefense.toString(),
          toughnessValue: "0",
        })
      } else {
        // Non-mook attacking multiple targets

        // Check if all targets are mooks
        const allTargetsAreMooks = targets.every(t => CS.isMook(t))

        if (allTargetsAreMooks) {
          // Multiple mook groups - calculate each group's defense (base + count), then add number of groups
          const defenses = targetIds.map((id, index) => {
            const target = targets[index]
            if (!target) return 0

            let defense = CS.defense(target)
            const mookCount = targetMookCountPerTarget[id] || 1
            defense += mookCount // Add the number of mooks in this group
            if (includeStunt) defense += 2
            return defense
          })
          const highestDefense = Math.max(...defenses)
          // Add the number of groups (not individual mooks)
          const combinedDefense = highestDefense + targetIds.length
          updateFields({
            defenseValue: combinedDefense.toString(),
            toughnessValue: "0",
          })
        } else {
          // Mixed or non-mook targets - highest defense + number of targets
          const defenses = targets.map(t => {
            let defense = CS.defense(t)
            if (includeStunt) defense += 2 // Add stunt modifier to each target
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
  }

  // Helper function to distribute mooks among targets
  const distributeMooks = (targetIds: string[]) => {
    if (!attacker || !CS.isMook(attacker)) return

    const totalMooks = attacker.count || 0

    if (targetIds.length === 0) {
      updateFields({
        mookDistribution: {},
        totalAttackingMooks: 0,
      })
      return
    }

    const distribution = distributeMooksAmongTargets(totalMooks, targetIds)

    updateFields({
      mookDistribution: distribution,
      totalAttackingMooks: totalMooks,
    })
  }

  // Helper function to calculate effective defense for a target based on their defense choice
  const calculateTargetDefense = (
    target: Character,
    targetId: string
  ): number => {
    return calcTargetDefense(
      target,
      targetId,
      manualDefensePerTarget,
      defenseChoicePerTarget,
      fortuneDiePerTarget,
      stunt,
      attacker,
      targetMookCount
    )
  }

  // Reset when attacker changes
  useEffect(() => {
    // Initialize total attacking mooks for mook attackers
    const currentAttacker = allShots.find(
      s => s.character?.shot_id === attackerShotId
    )?.character
    const totalMooks =
      currentAttacker && CS.isMook(currentAttacker)
        ? currentAttacker.count || 0
        : 0

    updateFields({
      mookRolls: [],
      showMookRolls: false,
      selectedTargetIds: [],
      mookDistribution: {},
      defenseValue: "0",
      toughnessValue: "0",
      swerve: "", // Reset to empty, not 0
      finalDamage: "", // Reset to empty, not 0
      defenseChoicePerTarget: {},
      fortuneDiePerTarget: {},
      defenseAppliedPerTarget: {},
      manualDefensePerTarget: {},
      manualToughnessPerTarget: {},
      totalAttackingMooks: totalMooks,
      multiTargetResults: {}, // Clear multi-target results
      showMultiTargetResults: false, // Hide multi-target results display
    })
  }, [attackerShotId, allShots])

  // Recalculate defense when mook counts change
  useEffect(() => {
    // Only recalculate for multiple mook groups
    if (selectedTargetIds.length > 1 && !CS.isMook(attacker)) {
      const targets = selectedTargetIds
        .map(id => allShots.find(s => s.character?.shot_id === id)?.character)
        .filter((char): char is Character => char !== undefined)

      const allTargetsAreMooks = targets.every(t => CS.isMook(t))

      if (
        allTargetsAreMooks &&
        Object.keys(targetMookCountPerTarget).length > 0
      ) {
        // Recalculate combined defense for multiple mook groups
        const defenses = selectedTargetIds.map((id, index) => {
          const target = targets[index]
          if (!target) return 0

          let defense = CS.defense(target)
          const mookCount = targetMookCountPerTarget[id] || 1
          defense += mookCount // Add the number of mooks in this group
          if (formState.data.stunt) defense += 2
          return defense
        })
        const highestDefense = Math.max(...defenses)
        const combinedDefense = highestDefense + selectedTargetIds.length
        updateField("defenseValue", combinedDefense.toString())
      }
    }
  }, [targetMookCountPerTarget, selectedTargetIds, formState.data.stunt])

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

    const av = calculateEffectiveAttackValue(
      attacker,
      attackerWeapons,
      allShots
    )
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
      const targetShot = allShots.find(
        s => s.character?.shot_id === targetShotId
      )
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

    updateFields({
      mookRolls: allTargetRolls,
      showMookRolls: true,
      finalDamage: grandTotalWounds.toString(),
    })
  }

  const handleApplyDamage = async () => {
    console.log("doing something")
    // Handle multiple targets for non-mook attackers
    if (
      !CS.isMook(attacker) &&
      selectedTargetIds.length > 0 &&
      multiTargetResults.length > 0
    ) {
      updateField("isProcessing", true)
      try {
        const shots = parseInt(shotCost) || 3

        // Collect all character updates with complete states
        const characterUpdates: Array<{
          shot_id?: string
          character_id?: string
          shot?: number
          wounds?: number
          count?: number
          impairments?: number
          defense?: number
          action_values?: Record<string, number>
          event?: {
            type: string
            description: string
            details?: Record<string, unknown>
          }
        }> = []

        // Add attacker's shot spending to character updates
        if (attackerShot && attackerShot.character) {
          const currentShot = attackerShot.shot || 0
          const newShot = currentShot - shots
          
          // Calculate complete state for attacker
          const attackerUpdate: {
            shot_id?: string
            character_id?: string
            shot?: number
            action_values?: Record<string, number>
            event?: {
              type: string
              description: string
              details?: Record<string, unknown>
            }
          } = {
            shot_id: attackerShot.character.shot_id,
            character_id: attackerShot.character.id,
            shot: newShot,
            event: {
              type: "act",
              description: `${attacker.name} acts (${shots} shots)`,
              details: {
                character_id: attackerShot.character.id,
                shot_cost: shots,
                from_shot: currentShot,
                to_shot: newShot,
              },
            },
          }
          
          // If attacker is spending fortune for extra damage
          if (formState.data.fortuneSpent && CS.isPC(attacker)) {
            const currentFortune = CS.fortune(attacker)
            if (currentFortune > 0) {
              attackerUpdate.action_values = {
                Fortune: currentFortune - 1
              }
            }
          }
          
          characterUpdates.push(attackerUpdate)
        }

        // Add dodge actions for targets that have dodge selected
        for (const targetId of selectedTargetIds) {
          const choice = defenseChoicePerTarget[targetId]
          if (choice === "dodge" || choice === "fortune") {
            const targetShot = allShots.find(
              s => s.character?.shot_id === targetId
            )
            const targetChar = targetShot?.character
            if (targetChar && targetShot) {
              const currentShot = targetShot.shot || 0
              const newShot = currentShot - 1
              
              // Add dodge shot spending to character updates
              const dodgeUpdate: {
                shot_id?: string
                character_id?: string
                shot?: number
                action_values?: Record<string, number>
                event?: {
                  type: string
                  description: string
                  details?: Record<string, unknown>
                }
              } = {
                shot_id: targetChar.shot_id,
                character_id: targetChar.id,
                shot: newShot, // Update shot position on Shot record
                event: {
                  type: "dodge",
                  description: choice === "fortune" 
                    ? `${targetChar.name} dodges with fortune`
                    : `${targetChar.name} dodges`,
                  details: {
                    character_id: targetChar.id,
                    dodge_type: choice,
                    from_shot: currentShot,
                    to_shot: newShot,
                  },
                },
              }
              
              // If using fortune dodge, update fortune points for PCs
              if (choice === "fortune" && CS.isPC(targetChar)) {
                const currentFortune = CS.fortune(targetChar)
                if (currentFortune > 0) {
                  dodgeUpdate.action_values = {
                    Fortune: currentFortune - 1
                  }
                }
              }
              
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
          const currentDefense = calculateTargetDefense(
            targetChar,
            result.targetId
          )
          const hasDefenseModifier =
            defenseChoicePerTarget[result.targetId] &&
            defenseChoicePerTarget[result.targetId] !== "none"

          let effectiveWounds = result.wounds
          if (hasDefenseModifier && selectedTargetIds.length > 1) {
            // For multiple targets with dodge, recalculate outcome for this specific target
            const individualOutcome =
              parseInt(attackValue || "0") +
              parseInt(swerve || "0") -
              currentDefense
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

          const isPC = CS.isPC(targetChar)
          const currentWounds = CS.wounds(targetChar)

          // For mooks, reduce the count; for others, add wounds
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

          // Include defense choice in the description
          const defenseChoice =
            defenseChoicePerTarget[result.targetId] || "none"
          const defenseDesc =
            defenseChoice === "fortune"
              ? ` (Fortune dodge +3 +${fortuneDiePerTarget[result.targetId] || 0})`
              : defenseChoice === "dodge"
                ? " (Dodge +3)"
                : ""

          // Calculate updated Fortune points if fortune dodge was used
          let updatedFortune: number | undefined
          if (defenseChoice === "fortune" && CS.isPC(targetChar)) {
            const currentFortune = CS.fortune(targetChar)
            if (currentFortune > 0) {
              updatedFortune = currentFortune - 1
              toastInfo(`${targetChar.name} spent 1 Fortune point for dodge`)
            }
          }

          // Collect character update for this target with complete state
          const isMook = CS.isMook(targetChar)
          const description = isMook
            ? `${attacker.name} took out ${effectiveWounds} ${effectiveWounds === 1 ? "mook" : "mooks"}${defenseDesc}`
            : `${attacker.name} attacked ${targetChar.name}${defenseDesc} for ${effectiveWounds} wounds`

          const targetUpdate: {
            shot_id?: string
            character_id?: string
            wounds?: number
            count?: number
            impairments?: number
            action_values?: Record<string, number>
            event?: {
              type: string
              description: string
              details?: Record<string, unknown>
            }
          } = {
            shot_id: targetChar.shot_id,
            character_id: targetChar.id,
            impairments: newImpairments,
            event: {
              type: "attack",
              description,
              details: {
                attacker_id: attackerShot.character?.id,
                target_id: targetChar.id,
                damage: effectiveWounds,
                attack_value: calculateEffectiveAttackValue(
                  attacker,
                  attackerWeapons,
                  allShots
                ),
                defense_value: parseInt(defenseValue),
                effective_defense: calculateTargetDefense(
                  targetChar,
                  result.targetId
                ),
                swerve: parseInt(swerve),
                outcome:
                  calculateEffectiveAttackValue(
                    attacker,
                    attackerWeapons,
                    allShots
                  ) +
                  parseInt(swerve) -
                  parseInt(defenseValue),
                weapon_damage: parseInt(weaponDamage),
                shot_cost: shots,
                stunt: stunt,
                dodge: defenseChoice !== "none",
                defense_choice: defenseChoice,
                fortune_die:
                  defenseChoice === "fortune"
                    ? parseInt(fortuneDiePerTarget[result.targetId] || "0")
                    : undefined,
                is_mook_takedown: isMook,
                mooks_taken_out: isMook ? effectiveWounds : undefined,
              },
            },
          }
          
          // For PCs, update action values (wounds, fortune)
          if (isPC) {
            targetUpdate.action_values = {
              Wounds: newWounds
            }
            
            // If fortune was spent for dodge, include it
            if (updatedFortune !== undefined) {
              targetUpdate.action_values.Fortune = updatedFortune
            }
          } else {
            // For NPCs and mooks, wounds/count go on the shot record
            targetUpdate.wounds = isMook ? undefined : newWounds
            targetUpdate.count = isMook ? newWounds : undefined
          }
          
          characterUpdates.push(targetUpdate)

          const toastMessage = isMook
            ? `Took out ${effectiveWounds} ${effectiveWounds === 1 ? "mook" : "mooks"}${defenseDesc}`
            : `Applied ${effectiveWounds} wound${effectiveWounds !== 1 ? "s" : ""} to ${targetChar.name}${defenseDesc}`

          toastSuccess(toastMessage)
        }

        // Send all character updates in a single batched request
        if (characterUpdates.length > 0) {
          await client.applyCombatAction(encounter, characterUpdates)
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

    // Handle mook attackers (single or multiple targets)
    if (
      CS.isMook(attacker) &&
      selectedTargetIds.length >= 1 &&
      mookRolls.length > 0
    ) {
      updateField("isProcessing", true)
      try {
        const shots = parseInt(shotCost) || 3

        // Collect all character updates with complete states
        const characterUpdates: Array<{
          shot_id?: string
          character_id?: string
          shot?: number
          wounds?: number
          count?: number
          impairments?: number
          defense?: number
          action_values?: Record<string, number>
          event?: {
            type: string
            description: string
            details?: Record<string, unknown>
          }
        }> = []

        // Add attacker's shot spending to combat actions
        if (attackerShot) {
          const currentShot = attackerShot.shot || 0
          const newShot = currentShot - shots
          characterUpdates.push({
            shot_id: attackerShot.character?.shot_id || "",
            character_id: attackerShot.character?.id,
            shot: newShot,
            event: {
              type: "act",
              description: `${attacker.name} acts (${shots} shots)`,
              details: {
                character_id: attackerShot.character?.id,
                shot_cost: shots,
                from_shot: currentShot,
                to_shot: newShot,
              },
            },
          })
        }

        // Collect wounds updates for each target
        for (const targetGroup of mookRolls) {
          const targetShot = allShots.find(
            s => s.character?.shot_id === targetGroup.targetId
          )
          const targetChar = targetShot?.character
          if (!targetChar) continue

          const totalWounds = targetGroup.rolls.reduce(
            (sum, r) => sum + r.wounds,
            0
          )
          if (totalWounds === 0) continue // Skip targets with no wounds

          // Check if this is mook vs mook combat
          if (CS.isMook(targetChar)) {
            // Mook vs mook: reduce mook count instead of applying wounds
            const currentCount = targetChar.count || 0
            const newCount = Math.max(0, currentCount - totalWounds)

            // Collect combat action for mook elimination
            characterUpdates.push({
              shot_id: targetChar.shot_id || "",
              character_id: targetChar.id,
              count: newCount, // New mook count
              impairments: 0, // Mooks don't have impairments
              event: {
                type: "attack",
                description: `${targetGroup.rolls.length} ${attacker.name} attacked ${targetChar.name}, eliminating ${totalWounds} mook${totalWounds !== 1 ? "s" : ""}`,
                details: {
                  attacker_id: attackerShot.character?.id,
                  target_id: targetChar.id,
                  mooks_eliminated: totalWounds,
                  attack_value: calculateEffectiveAttackValue(
                    attacker,
                    attackerWeapons,
                    allShots
                  ),
                  defense_value: CS.defense(targetChar),
                  shot_cost: shots,
                  is_mook_vs_mook: true,
                  attacking_mooks: targetGroup.rolls.length,
                  successful_hits: targetGroup.rolls.filter(r => r.hit).length,
                },
              },
            })

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

            // Collect combat action for this target
            const targetUpdate: {
              shot_id: string
              character_id: string
              impairments: number
              wounds?: number
              action_values?: Record<string, number>
              event: {
                type: string
                description: string
                details: Record<string, unknown>
              }
            } = {
              shot_id: targetChar.shot_id || "",
              character_id: targetChar.id,
              impairments: newImpairments,
              event: {
                type: "attack",
                description: `${targetGroup.rolls.length} ${attacker.name} attacked ${targetChar.name} for ${totalWounds} wounds`,
                details: {
                  attacker_id: attackerShot.character?.id,
                  target_id: targetChar.id,
                  damage: totalWounds,
                  attack_value: calculateEffectiveAttackValue(
                    attacker,
                    attackerWeapons,
                    allShots
                  ),
                  defense_value: CS.defense(targetChar),
                  weapon_damage: parseInt(weaponDamage),
                  shot_cost: shots,
                  is_mook_attack: true,
                  mook_count: targetGroup.rolls.length,
                  mook_hits: targetGroup.rolls.filter(r => r.hit).length,
                },
              },
            }
            
            // For PCs, update action values (wounds go there)
            if (isPC) {
              targetUpdate.action_values = {
                Wounds: newWounds
              }
            } else {
              // For NPCs and mooks, wounds/count go on the shot record
              targetUpdate.wounds = newWounds
            }
            
            characterUpdates.push(targetUpdate)

            toastSuccess(
              `Applied ${totalWounds} wound${totalWounds !== 1 ? "s" : ""} to ${targetChar.name}`
            )
          }
        }

        // Send all character updates in a single batched request
        if (characterUpdates.length > 0) {
          await client.applyCombatAction(encounter, characterUpdates)
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

    // Single-target attack handling for non-mook attackers with single target
    if (!CS.isMook(attacker) && selectedTargetIds.length === 1 && finalDamage) {
      updateField("isProcessing", true)
      try {
        const shots = parseInt(shotCost) || 3
        const damage = parseInt(finalDamage) || 0
        const targetChar = target
        if (!targetChar || !attackerShot) return

        // Collect combat action for single target
        const characterUpdates: Array<{
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
        }> = []

        // Add attacker's shot spending to combat actions
        if (attackerShot) {
          const currentShot = attackerShot.shot || 0
          const newShot = currentShot - shots
          characterUpdates.push({
            shot_id: attackerShot.character?.shot_id || "",
            character_id: attackerShot.character?.id,
            shot: newShot,
            event: {
              type: "act",
              description: `${attacker.name} acts (${shots} shots)`,
              details: {
                character_id: attackerShot.character?.id,
                shot_cost: shots,
                from_shot: currentShot,
                to_shot: newShot,
              },
            },
          })
        }

        const isPC = CS.isPC(targetChar)
        const currentWounds = CS.wounds(targetChar)

        // Calculate actual wounds
        let actualWoundsDealt = 0
        let newWounds = 0
        let newImpairments = 0

        if (CS.isMook(targetChar)) {
          // For mooks, the damage is the number to eliminate
          actualWoundsDealt = damage
          newWounds = Math.max(0, currentWounds - actualWoundsDealt)
        } else {
          // For non-mooks, subtract toughness from smackdown
          const toughness =
            parseInt(toughnessValue) || CS.toughness(targetChar) || 0
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

        // Create combat action
        const targetUpdate: {
          shot_id: string
          character_id: string
          impairments: number
          wounds?: number
          count?: number
          action_values?: Record<string, number>
          event: {
            type: string
            description: string
            details: Record<string, unknown>
          }
        } = {
          shot_id: targetChar.shot_id || "",
          character_id: targetChar.id,
          impairments: newImpairments,
          event: {
            type: "attack",
            description: `${attacker.name} attacked ${targetChar.name} for ${actualWoundsDealt} wounds`,
            details: {
              attacker_id: attackerShot.character?.id,
              target_id: targetChar.id,
              damage: actualWoundsDealt,
              attack_value: parseInt(attackValue),
              defense_value: parseInt(defenseValue),
              swerve: parseInt(swerve),
              outcome:
                parseInt(attackValue) -
                parseInt(defenseValue) +
                parseInt(swerve),
              weapon_damage: parseInt(weaponDamage),
              shot_cost: shots,
              stunt: stunt,
            },
          },
        }
        
        // For PCs, update action values (wounds go there)
        if (isPC) {
          targetUpdate.action_values = {
            Wounds: newWounds
          }
        } else {
          // For NPCs and mooks, wounds/count go on the shot record
          if (CS.isMook(targetChar)) {
            targetUpdate.count = newWounds
          } else {
            targetUpdate.wounds = newWounds
          }
        }
        
        characterUpdates.push(targetUpdate)

        // Send combat action
        await client.applyCombatAction(encounter, characterUpdates)

        toastSuccess(
          `Applied ${actualWoundsDealt} wound${actualWoundsDealt !== 1 ? "s" : ""} to ${targetChar.name}`
        )

        // Reset form
        updateFields({
          targetShotId: "",
          selectedTargetIds: [],
          swerve: "",
          finalDamage: "",
          stunt: false,
          mookRolls: [],
          showMookRolls: false,
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
            allShots={allShots}
            selectedTargetIds={selectedTargetIds}
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
            <CombatResolution
              attacker={attacker}
              allShots={allShots}
              selectedTargetIds={selectedTargetIds}
              swerve={swerve}
              finalDamage={finalDamage}
              shotCost={shotCost}
              showMultiTargetResults={showMultiTargetResults}
              multiTargetResults={multiTargetResults}
              isProcessing={isProcessing}
              updateField={updateField}
              handleApplyDamage={handleApplyDamage}
            />
          )}

          {/* Attack Results for Non-Mook Attackers (single or multiple targets) */}
          {showMultiTargetResults && (
            <AttackResults
              attacker={attacker}
              attackerWeapons={attackerWeapons}
              allShots={allShots}
              selectedTargetIds={selectedTargetIds}
              multiTargetResults={multiTargetResults}
              attackValue={attackValue}
              swerve={swerve}
              defenseValue={defenseValue}
              weaponDamage={weaponDamage}
              defenseChoicePerTarget={defenseChoicePerTarget}
              calculateEffectiveAttackValue={calculateEffectiveAttackValue}
              calculateTargetDefense={calculateTargetDefense}
            />
          )}

          {/* Summary of wounds to apply */}
          {showMultiTargetResults && multiTargetResults.length > 0 && (
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
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
