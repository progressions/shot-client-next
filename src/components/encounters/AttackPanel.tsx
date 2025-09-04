"use client"

import { useMemo, useEffect, useState } from "react"
import { Box, Typography } from "@mui/material"
import { useEncounter, useToast } from "@/contexts"
import { CS, DS, CES } from "@/services"
import type {
  Character,
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
import {
  handleNonMookMultipleTargets,
  handleMookAttack,
  handleSingleTargetAttack,
} from "./attacks/attackHandlers"

interface ExtendedAttackPanelProps {
  onClose?: () => void
  preselectedAttacker?: Character
}

export default function AttackPanel({ onClose, preselectedAttacker }: ExtendedAttackPanelProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter, weapons: encounterWeapons } = useEncounter()
  const { toastSuccess, toastError, toastInfo } = useToast()
  const { client } = useClient()

  // Delay rendering of heavy content to allow animation to start
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Initialize form state with useForm
  const { formState, dispatchForm } = useForm<AttackFormData>({
    // Attacker state
    attackerShotId: preselectedAttacker?.shot_id || "",
    attackSkill: preselectedAttacker ? CS.mainAttack(preselectedAttacker) : "",
    attackValue: preselectedAttacker ? String(CS.skill(preselectedAttacker, CS.mainAttack(preselectedAttacker))) : "",
    attackValueChange: 0, // Track effect changes
    selectedWeaponId: preselectedAttacker?.weapon_ids?.[0] || "",
    weaponDamage: "",
    damageChange: 0, // Track effect changes
    shotCost: "3",

    // Target state
    selectedTargetIds: [],
    targetShotId: "", // For backward compatibility
    defenseValue: "0",
    toughnessValue: "0",
    stunt: false,
    kachunkActive: false,
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
    smackdown: "",
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
    attackValue,
    defenseValue,
    toughnessValue,
    weaponDamage,
    swerve,
    stunt,
    smackdown,
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
    manualDefensePerTarget,
    targetShotId,
  } = formState.data

  // Create form update helpers
  const updateField = createFieldUpdater<AttackFormData>(dispatchForm)
  const updateFields = createFieldsUpdater<AttackFormData>(dispatchForm)

  // Helper function to calculate effective attack value
  // Note: The attack value already includes effects and impairments from the UI
  const calculateEffectiveAttackValue = (): number => {
    // The attackValue from the form already includes all modifiers
    // (effects, impairments, mook bonuses) as calculated in the UI
    return parseInt(attackValue) || 0
  }

  // Get all characters in the fight (excluding hidden ones)
  const allShots = useMemo(
    () => getAllVisibleShots(encounter.shots),
    [encounter.shots]
  )

  // Sort attacker shots by: shot position (higher first), character type priority, then speed
  const sortedAttackerShots = useMemo(
    () => sortAttackerShots(allShots, encounter),
    [allShots, encounter]
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

      // Get action value with effects applied
      // adjustedActionValue returns [change, adjustedValue]
      const [, av] = CES.adjustedActionValue(
        attacker,
        mainAttack,
        encounter,
        false // don't ignore impairments for the actual value
      )

      // Get just the effects change (without impairments) for display
      const [effectsOnlyChange] = CES.adjustedActionValue(
        attacker,
        mainAttack,
        encounter,
        true // ignore impairments to get only effects change
      )

      // Get default weapon and damage
      const weaponIds = attacker.weapon_ids || []
      const charWeapons = weaponIds
        .map(id => encounterWeapons[id])
        .filter((weapon): weapon is Weapon => weapon !== undefined)

      const updates: Partial<AttackFormData> = {
        attackSkill: mainAttack,
        attackValueChange: effectsOnlyChange, // Store only the change from effects (not impairments)
      }

      if (charWeapons.length > 0) {
        const firstWeapon = charWeapons[0]
        updates.selectedWeaponId = firstWeapon.id?.toString() || ""

        // Apply effects to weapon damage if applicable
        const [damageChange, _modifiedDamage] = CES.adjustedActionValue(
          attacker,
          "Damage",
          encounter,
          true // ignore impairments for damage
        )
        updates.weaponDamage = (firstWeapon.damage + damageChange).toString()
        updates.damageChange = damageChange // Store the change from effects
        // Don't add mook bonus here - it will be added when mook targets are selected
      } else {
        updates.selectedWeaponId = "unarmed"
        const baseDamage = CS.damage(attacker) || 7
        const [damageChange, _modifiedDamage] = CES.adjustedActionValue(
          attacker,
          "Damage",
          encounter,
          true // ignore impairments for damage
        )
        updates.weaponDamage = (baseDamage + damageChange).toString()
        updates.damageChange = damageChange // Store the change from effects
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

          // Calculate smackdown (outcome + weapon damage)
          const calculatedSmackdown = outcome >= 0 ? outcome + weaponDmg : 0

          // Calculate total wounds from all targets
          const totalWounds = results.reduce((sum, r) => sum + r.wounds, 0)

          console.log("Attack calculation:", {
            attackValue: av,
            defense: dv,
            swerve: sw,
            weaponDamage: weaponDmg,
            outcome,
            smackdown: calculatedSmackdown,
            totalWounds,
          })

          updateFields({
            multiTargetResults: results,
            showMultiTargetResults: true,
            smackdown: calculatedSmackdown.toString(),
            finalDamage: totalWounds.toString(),
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

  // Function to recalculate wounds based on smackdown
  const recalculateWoundsFromSmackdown = (smackdownValue: string) => {
    if (selectedTargetIds.length > 0 && !CS.isMook(attacker)) {
      const smackdown = parseInt(smackdownValue) || 0

      const results = selectedTargetIds
        .map(targetId => {
          const targetShot = allShots.find(
            s => s.character?.shot_id === targetId
          )
          const targetChar = targetShot?.character
          if (!targetChar) return null

          const targetDefense = CS.defense(targetChar)
          const targetToughness = CS.toughness(targetChar)

          let wounds = 0

          // For mooks, if smackdown > 0, take out the targeted number
          if (CS.isMook(targetChar)) {
            if (smackdown > 0) {
              wounds =
                targetMookCountPerTarget[targetId] || targetMookCount || 1
            }
          } else {
            // For non-mooks, subtract toughness from smackdown
            wounds = Math.max(0, smackdown - targetToughness)
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

      // Calculate total wounds from all targets
      const totalWounds = results.reduce((sum, r) => sum + r.wounds, 0)

      updateFields({
        multiTargetResults: results,
        finalDamage: totalWounds.toString(),
      })
    }
  }

  // Handle smackdown field change
  const handleSmackdownChange = (value: string) => {
    updateField("smackdown", value)
    recalculateWoundsFromSmackdown(value)
  }

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
    includeStunt: boolean = false,
    overrideDefenseChoices?: { [key: string]: "none" | "dodge" | "fortune" },
    overrideFortuneDice?: { [key: string]: string },
    overrideManualDefense?: { [key: string]: string }
  ) => {
    // Use overrides if provided, otherwise use state values
    const currentDefenseChoices =
      overrideDefenseChoices || defenseChoicePerTarget
    const currentFortuneDice = overrideFortuneDice || fortuneDiePerTarget
    const currentManualDefense = overrideManualDefense || manualDefensePerTarget
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
        // Use calculateTargetDefense to include all modifiers (effects, dodge, fortune, etc.)
        const finalDefense = calcTargetDefense(
          target,
          targetId,
          currentManualDefense,
          currentDefenseChoices,
          currentFortuneDice,
          includeStunt,
          attacker,
          CS.isMook(target)
            ? targetMookCountPerTarget[targetId] || targetMookCount || 1
            : 1,
          encounter
        )

        // Get toughness with effects applied
        const [_toughnessChange, toughness] = CES.adjustedActionValue(
          target,
          "Toughness",
          encounter,
          true // ignore impairments for toughness
        )

        // Update the defense value - don't set manual override anymore since calculateTargetDefense handles it
        updateFields({
          defenseValue: finalDefense.toString(),
          toughnessValue: toughness.toString(),
        })
      }
    } else {
      // Multiple targets
      if (attacker && CS.isMook(attacker)) {
        // Mooks attacking multiple targets - no defense modifier, just show highest for reference
        const defenses = targetIds.map((id, index) => {
          const target = targets[index]
          if (!target) return 0
          // Use calculateTargetDefense to include all modifiers
          return calcTargetDefense(
            target,
            id,
            currentManualDefense,
            currentDefenseChoices,
            currentFortuneDice,
            includeStunt,
            attacker,
            targetMookCount,
            encounter
          )
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
            // Use calculateTargetDefense which includes effects, dodge, and mook count
            const mookCount = targetMookCountPerTarget[id] || 1
            return calcTargetDefense(
              target,
              id,
              currentManualDefense,
              currentDefenseChoices,
              currentFortuneDice,
              includeStunt,
              attacker,
              mookCount, // Pass the specific mook count for this group
              encounter
            )
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
          const defenses = targetIds.map((id, index) => {
            const target = targets[index]
            if (!target) return 0
            // Use calculateTargetDefense to include all modifiers (effects, dodge, fortune, etc.)
            return calcTargetDefense(
              target,
              id,
              currentManualDefense,
              currentDefenseChoices,
              currentFortuneDice,
              includeStunt,
              attacker,
              targetMookCount,
              encounter
            )
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
      targetMookCount,
      encounter
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

          // Use calculateTargetDefense to include all modifiers
          const mookCount = targetMookCountPerTarget[id] || 1
          return calcTargetDefense(
            target,
            id,
            manualDefensePerTarget,
            defenseChoicePerTarget,
            fortuneDiePerTarget,
            formState.data.stunt,
            attacker,
            mookCount,
            encounter
          )
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
    console.log("[Apply Damage] Starting with:", {
      attacker: attacker?.name,
      selectedTargetIds,
      multiTargetResults,
      finalDamage,
      swerve,
      attackValue,
      defenseValue,
    })
    updateField("isProcessing", true)

    try {
      // Handle non-mook attacker with multiple targets
      if (
        !CS.isMook(attacker) &&
        selectedTargetIds.length > 0 &&
        multiTargetResults.length > 0
      ) {
        console.log("[Apply Damage] Handling non-mook multi-target attack")
        await handleNonMookMultipleTargets(
          client,
          encounter,
          attackerShot,
          attacker,
          allShots,
          multiTargetResults,
          parseInt(shotCost),
          weaponDamage,
          attackValue,
          swerve,
          defenseValue,
          stunt,
          selectedTargetIds,
          defenseChoicePerTarget,
          fortuneDiePerTarget,
          targetMookCount,
          calculateTargetDefense,
          calculateEffectiveAttackValue,
          attackerWeapons,
          toastSuccess,
          toastInfo,
          toastError,
          formState
        )

        // Reset form
        updateFields({
          selectedTargetIds: [],
          multiTargetResults: [],
          showMultiTargetResults: false,
          swerve: "",
          finalDamage: "",
          stunt: false,
          kachunkActive: false,
          defenseChoicePerTarget: {},
          fortuneDiePerTarget: {},
          defenseAppliedPerTarget: {},
          manualDefensePerTarget: {},
          manualToughnessPerTarget: {},
          targetMookCount: 1,
        })

        if (onClose) onClose()
        return
      }

      // Handle mook attackers (single or multiple targets)
      if (
        CS.isMook(attacker) &&
        selectedTargetIds.length >= 1 &&
        mookRolls.length > 0
      ) {
        await handleMookAttack(
          client,
          encounter,
          attackerShot,
          attacker,
          allShots,
          mookRolls,
          parseInt(shotCost),
          weaponDamage,
          calculateEffectiveAttackValue,
          attackerWeapons,
          toastSuccess,
          toastError
        )

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
          kachunkActive: false,
          defenseChoicePerTarget: {},
          fortuneDiePerTarget: {},
          defenseAppliedPerTarget: {},
        })

        if (onClose) onClose()
        return
      }

      // Handle single-target attack for non-mook attackers
      if (
        !CS.isMook(attacker) &&
        selectedTargetIds.length === 1 &&
        finalDamage &&
        target
      ) {
        await handleSingleTargetAttack(
          client,
          encounter,
          attackerShot,
          attacker,
          target,
          finalDamage,
          toughnessValue,
          parseInt(shotCost),
          attackValue,
          defenseValue,
          swerve,
          weaponDamage,
          stunt,
          toastSuccess,
          toastError
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

        if (onClose) onClose()
        return
      }
    } catch (error) {
      toastError("Failed to apply damage")
      console.error(error)
    } finally {
      updateField("isProcessing", false)
    }
  }

  return (
    <Box sx={{ overflow: "hidden", minHeight: isReady ? "auto" : "100px" }}>
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
      {isReady ? (
        <>
          <Box sx={{ backgroundColor: "action.hover" }}>
            {/* Attacker Section - Only show if not preselected */}
            {!preselectedAttacker && (
              <AttackerSection
                sortedAttackerShots={sortedAttackerShots}
                formState={formState}
                dispatchForm={dispatchForm}
                attacker={attacker}
                attackerWeapons={attackerWeapons}
                allShots={allShots}
                selectedTargetIds={selectedTargetIds}
              />
            )}

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
              encounter={encounter}
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
                smackdown={smackdown}
                finalDamage={finalDamage}
                shotCost={shotCost}
                showMultiTargetResults={showMultiTargetResults}
                multiTargetResults={multiTargetResults}
                isProcessing={isProcessing}
                updateField={updateField}
                handleApplyDamage={handleApplyDamage}
                handleSmackdownChange={handleSmackdownChange}
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
                smackdown={smackdown}
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
        </>
      ) : null}
    </Box>
  )
}
