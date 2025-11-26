import { useState, useEffect, useMemo, useCallback } from "react"
import { useEncounter, useToast } from "@/contexts"
import { CS, CES } from "@/services"
import type { Character, Weapon, AttackFormData } from "@/types"
import { useClient } from "@/contexts/AppContext"
import { useForm } from "@/reducers"
import {
  calculateTargetDefense as calcTargetDefense,
  distributeMooksAmongTargets,
} from "./attackCalculations"
import { sortTargetShots, getAllVisibleShots } from "./shotSorting"
import { createFieldUpdater, createFieldsUpdater } from "./formHelpers"
import {
  handleNonMookMultipleTargets,
  handleMookAttack,
  handleSingleTargetAttack,
} from "./attackHandlers"
import { calculateMookRolls } from "./mookAttackRolls"

interface UseAttackPanelControllerProps {
  preselectedAttacker: Character
  onComplete?: () => void
}

export function useAttackPanelController({
  preselectedAttacker,
  onComplete,
}: UseAttackPanelControllerProps) {
  const [isReady, setIsReady] = useState(false)
  const { encounter, weapons: encounterWeapons } = useEncounter()
  const { toastSuccess, toastError, toastInfo } = useToast()
  const { client } = useClient()

  // Delay rendering of heavy content
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  // Initialize form state with useForm
  const { formState, dispatchForm } = useForm<AttackFormData>({
    // Attacker state
    attackerShotId: preselectedAttacker.shot_id,
    attackSkill: CS.mainAttack(preselectedAttacker),
    attackValue: String(
      CS.skill(preselectedAttacker, CS.mainAttack(preselectedAttacker))
    ),
    attackValueChange: 0,
    selectedWeaponId: preselectedAttacker.weapon_ids?.[0] || "",
    weaponDamage: "",
    damageChange: 0,
    shotCost: "3",

    // Target state
    selectedTargetIds: [],
    targetShotId: "",
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

  // Destructure commonly used values
  const {
    attackerShotId,
    selectedTargetIds,
    attackValue,
    defenseValue,
    toughnessValue,
    weaponDamage,
    swerve,
    stunt,
    finalDamage,
    shotCost,
    mookRolls,
    mookDistribution,
    totalAttackingMooks,
    multiTargetResults,
    targetMookCount,
    targetMookCountPerTarget,
    defenseChoicePerTarget,
    fortuneDiePerTarget,
    manualDefensePerTarget,
    targetShotId,
    fortuneBonus,
  } = formState.data

  // Create form update helpers
  const updateField = createFieldUpdater<AttackFormData>(dispatchForm)
  const updateFields = createFieldsUpdater<AttackFormData>(dispatchForm)

  // Helper function to calculate effective attack value
  const calculateEffectiveAttackValue = useCallback((): number => {
    return parseInt(attackValue) || 0
  }, [attackValue])

  // Get all characters in the fight
  const allShots = useMemo(
    () => getAllVisibleShots(encounter.shots),
    [encounter.shots]
  )

  // Sort attacker shots (if needed for display, though currently not returned)
  // const _sortedAttackerShots = useMemo(...)

  // Get selected attacker
  const attackerShot = allShots.find(
    s => s.character?.shot_id === attackerShotId
  )
  const attacker = attackerShot?.character

  // Get all selected targets
  const selectedTargets = useMemo(
    () =>
      selectedTargetIds
        .map(id => allShots.find(s => s.character?.shot_id === id)?.character)
        .filter((char): char is Character => char !== undefined),
    [selectedTargetIds, allShots]
  )

  // For backward compatibility
  const target = selectedTargets[0]

  // Sort targets based on attacker type
  const sortedTargetShots = useMemo(
    () => sortTargetShots(allShots, attacker),
    [allShots, attacker]
  )

  // Get weapons for selected attacker
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
  useEffect(() => {
    if (attacker && "action_values" in attacker) {
      const mainAttack = CS.mainAttack(attacker)
      const [, av] = CES.adjustedActionValue(
        attacker,
        mainAttack,
        encounter,
        false
      )
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
      updates.shotCost =
        CS.isBoss(attacker) || CS.isUberBoss(attacker) ? "2" : "3"

      if (CS.isMook(attacker)) {
        updates.mookDistribution = {}
      }

      updateFields(updates)
    }
  }, [attacker, encounterWeapons, targetShotId, encounter, updateFields])

  // Helper function to calculate effective defense
  const calculateTargetDefense = useCallback(
    (
      target: Character,
      targetId: string,
      manualDefenseOverrides = manualDefensePerTarget,
      defenseChoiceOverrides = defenseChoicePerTarget,
      fortuneDieOverrides = fortuneDiePerTarget,
      includeStunt = stunt,
      attackingCharacter = attacker,
      explicitMookCount?: number,
      encounterContext = encounter
    ): number => {
      let resolvedMookCount = explicitMookCount

      if (CS.isMook(target)) {
        const perTargetCount =
          resolvedMookCount ?? targetMookCountPerTarget[targetId]
        const fallbackCount = targetMookCount || 1
        resolvedMookCount = Math.max(1, perTargetCount ?? fallbackCount ?? 1)
      } else {
        resolvedMookCount = 1
      }

      return calcTargetDefense(
        target,
        targetId,
        manualDefenseOverrides,
        defenseChoiceOverrides,
        fortuneDieOverrides,
        includeStunt,
        attackingCharacter,
        resolvedMookCount,
        encounterContext
      )
    },
    [
      manualDefensePerTarget,
      defenseChoicePerTarget,
      fortuneDiePerTarget,
      stunt,
      attacker,
      targetMookCountPerTarget,
      targetMookCount,
      encounter,
    ]
  )

  // Calculate damage when swerve is entered
  useEffect(() => {
    if (attacker && !CS.isMook(attacker)) {
      if (swerve && attackValue && defenseValue) {
        const av = calculateEffectiveAttackValue()
        const dv = parseInt(defenseValue) || 0
        const sw = parseInt(swerve) || 0
        const weaponDmg = parseInt(weaponDamage) || 0
        const fortuneVal = parseInt(fortuneBonus || "0") || 0

        const outcome = av - dv + sw + fortuneVal

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
              let wounds = 0

              if (CS.isMook(targetChar) && !CS.isMook(attacker)) {
                if (outcome >= 0) {
                  wounds =
                    targetMookCountPerTarget[targetId] || targetMookCount || 1
                }
              } else {
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

          const calculatedSmackdown = outcome >= 0 ? outcome + weaponDmg : 0
          const totalWounds = results.reduce((sum, r) => sum + r.wounds, 0)

          updateFields({
            multiTargetResults: results,
            showMultiTargetResults: true,
            smackdown: calculatedSmackdown.toString(),
            finalDamage: totalWounds.toString(),
          })
        } else {
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
    fortuneBonus,
    calculateEffectiveAttackValue,
    targetMookCountPerTarget,
    updateFields,
  ])

  // Reset defense choices when targets change
  useEffect(() => {
    updateFields({
      defenseChoicePerTarget: {},
      fortuneDiePerTarget: {},
      defenseAppliedPerTarget: {},
    })
  }, [selectedTargetIds, updateFields])

  // Helper to update defense and toughness
  const updateDefenseAndToughness = useCallback(
    (
      targetIds: string[],
      includeStunt: boolean = false,
      overrideDefenseChoices?: { [key: string]: "none" | "dodge" | "fortune" },
      overrideFortuneDice?: { [key: string]: string },
      overrideManualDefense?: { [key: string]: string }
    ) => {
      const currentDefenseChoices =
        overrideDefenseChoices || defenseChoicePerTarget
      const currentFortuneDice = overrideFortuneDice || fortuneDiePerTarget
      const currentManualDefense =
        overrideManualDefense || manualDefensePerTarget

      if (targetIds.length === 0) {
        updateFields({
          defenseValue: "0",
          toughnessValue: "0",
          manualDefensePerTarget: {},
        })
        return
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

          const [_toughnessChange, toughness] = CES.adjustedActionValue(
            target,
            "Toughness",
            encounter,
            true
          )

          updateFields({
            defenseValue: finalDefense.toString(),
            toughnessValue: toughness.toString(),
          })
        }
      } else {
        if (attacker && CS.isMook(attacker)) {
          const defenses = targetIds.map((id, index) => {
            const target = targets[index]
            if (!target) return 0
            return calculateTargetDefense(
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
          const allTargetsAreMooks = targets.every(t => CS.isMook(t))
          if (allTargetsAreMooks) {
            const defenses = targetIds.map((id, index) => {
              const target = targets[index]
              if (!target) return 0
              const mookCount = targetMookCountPerTarget[id] || 1
              return calculateTargetDefense(
                target,
                id,
                currentManualDefense,
                currentDefenseChoices,
                currentFortuneDice,
                includeStunt,
                attacker,
                mookCount,
                encounter
              )
            })
            const highestDefense = Math.max(...defenses)
            const combinedDefense = highestDefense + targetIds.length
            updateFields({
              defenseValue: combinedDefense.toString(),
              toughnessValue: "0",
            })
          } else {
            const defenses = targetIds.map((id, index) => {
              const target = targets[index]
              if (!target) return 0
              return calculateTargetDefense(
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
    },
    [
      allShots,
      attacker,
      defenseChoicePerTarget,
      encounter,
      fortuneDiePerTarget,
      manualDefensePerTarget,
      targetMookCount,
      targetMookCountPerTarget,
      updateFields,
      calculateTargetDefense,
    ]
  )

  // Helper to distribute mooks
  const distributeMooks = useCallback(
    (targetIds: string[]) => {
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
    },
    [attacker, updateFields]
  )

  // Reset when attacker changes
  useEffect(() => {
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
      swerve: "",
      finalDamage: "",
      defenseChoicePerTarget: {},
      fortuneDiePerTarget: {},
      defenseAppliedPerTarget: {},
      manualDefensePerTarget: {},
      manualToughnessPerTarget: {},
      totalAttackingMooks: totalMooks,
      multiTargetResults: [],
      showMultiTargetResults: false,
    })
  }, [attackerShotId, allShots, updateFields])

  // Recalculate defense when mook counts change (multi-target)
  useEffect(() => {
    if (selectedTargetIds.length > 1 && attacker && !CS.isMook(attacker)) {
      const targets = selectedTargetIds
        .map(id => allShots.find(s => s.character?.shot_id === id)?.character)
        .filter((char): char is Character => char !== undefined)

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
        const combinedDefense = highestDefense + selectedTargetIds.length
        updateField("defenseValue", combinedDefense.toString())
      }
    }
  }, [
    targetMookCountPerTarget,
    selectedTargetIds,
    stunt,
    attacker,
    allShots,
    manualDefensePerTarget,
    defenseChoicePerTarget,
    fortuneDiePerTarget,
    encounter,
    updateField,
    calculateTargetDefense,
  ])

  // Recalculate defense when single mook target count changes
  useEffect(() => {
    if (
      selectedTargetIds.length === 1 &&
      attacker &&
      !CS.isMook(attacker) &&
      targetMookCountPerTarget[selectedTargetIds[0]]
    ) {
      const target = allShots.find(
        s => s.character?.shot_id === selectedTargetIds[0]
      )?.character

      if (target && CS.isMook(target)) {
        updateDefenseAndToughness(
          selectedTargetIds,
          stunt,
          defenseChoicePerTarget,
          fortuneDiePerTarget,
          manualDefensePerTarget
        )
      }
    }
  }, [
    targetMookCountPerTarget,
    selectedTargetIds,
    stunt,
    attacker,
    allShots,
    defenseChoicePerTarget,
    fortuneDiePerTarget,
    manualDefensePerTarget,
    updateDefenseAndToughness,
  ])

  // Clear attack results when targets change
  useEffect(() => {
    updateFields({
      swerve: "",
      finalDamage: "",
      mookRolls: [],
      showMookRolls: false,
      multiTargetResults: [],
      showMultiTargetResults: false,
    })

    if (selectedTargetIds.length > 0) {
      updateDefenseAndToughness(selectedTargetIds, stunt)
      if (attacker && CS.isMook(attacker)) {
        distributeMooks(selectedTargetIds)
      }
    } else {
      updateFields({
        mookDistribution: {},
        totalAttackingMooks: 0,
      })
    }
  }, [
    selectedTargetIds,
    targetShotId,
    stunt,
    attacker,
    updateFields,
    updateDefenseAndToughness,
    distributeMooks,
  ])

  const handleRollMookAttacks = useCallback(() => {
    if (!attacker) return

    const result = calculateMookRolls({
      attacker,
      attackerWeapons,
      allShots,
      selectedTargetIds,
      mookDistribution,
      fortuneBonus: fortuneBonus || "0",
      calculateEffectiveAttackValue,
      weaponDamage,
      defenseValue,
      toughnessValue,
      targetShotId,
      totalAttackingMooks,
    })

    if (result) {
      updateFields({
        mookRolls: result.mookRolls,
        showMookRolls: true,
        finalDamage: result.finalDamage,
      })
    }
  }, [
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
    updateFields,
  ])

  const handleApplyDamage = async () => {
    updateField("isProcessing", true)
    try {
      if (
        !CS.isMook(attacker!) &&
        selectedTargetIds.length > 0 &&
        multiTargetResults.length > 0
      ) {
        await handleNonMookMultipleTargets(
          client,
          encounter,
          attackerShot!,
          attacker!,
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
          { data: formState.data }
        )
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
        if (onComplete) onComplete()
        return
      }

      if (
        CS.isMook(attacker!) &&
        selectedTargetIds.length >= 1 &&
        mookRolls.length > 0
      ) {
        await handleMookAttack(
          client,
          encounter,
          attackerShot!,
          attacker!,
          allShots,
          mookRolls,
          parseInt(shotCost),
          weaponDamage,
          calculateEffectiveAttackValue,
          attackerWeapons,
          toastSuccess
        )
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
        if (onComplete) onComplete()
        return
      }

      if (
        !CS.isMook(attacker!) &&
        selectedTargetIds.length === 1 &&
        finalDamage &&
        target
      ) {
        await handleSingleTargetAttack(
          client,
          encounter,
          attackerShot!,
          attacker!,
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
          toastError,
          { data: formState.data }
        )
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
        if (onComplete) onComplete()
        return
      }
    } catch (error) {
      toastError("Failed to apply damage")
      console.error(error)
    } finally {
      updateField("isProcessing", false)
    }
  }

  return {
    isReady,
    formState,
    dispatchForm,
    updateField,
    updateFields,
    attacker,
    attackerShotId,
    attackerWeapons,
    allShots,
    sortedTargetShots,
    selectedTargetIds,
    calculateEffectiveAttackValue,
    handleRollMookAttacks,
    handleApplyDamage,
    calculateTargetDefense,
    updateDefenseAndToughness,
    distributeMooks,
  }
}
