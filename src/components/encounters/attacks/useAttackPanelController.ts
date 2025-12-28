import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useEncounter, useToast } from "@/contexts"
import { CS } from "@/services"
import type { Character, Weapon, AttackFormData, Shot } from "@/types"
import { useClient } from "@/contexts/AppContext"
import { useForm } from "@/reducers"
import {
  calculateTargetDefense as calcTargetDefense,
  distributeMooksAmongTargets,
  getDefenseAndToughnessValues,
  calculateNonMookDamageOutcome,
  initializeAttackerProperties,
  recalculateMookDefense, // Add this import
} from "./attackCalculations"
import { sortTargetShots, getAllVisibleShots } from "./shotSorting"
import { createFieldUpdater, createFieldsUpdater } from "./formHelpers"

import { calculateMookRolls } from "./mookAttackRolls"
import {
  resetAttackPanelForm,
  resetOnAttackerChange,
  resetAttackRelatedFields,
} from "./formResets" // Add resetOnAttackerChange
import {
  handleNonMookMultiTargetApplication, // Add this import
  handleMookApplication,
  handleSingleTargetApplication,
} from "./damageApplicationHelpers"

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
    mookRolls,
    mookDistribution,
    totalAttackingMooks,
    multiTargetResults,
    targetMookCount,
    targetMookCountPerTarget,
    defenseChoicePerTarget,
    fortuneDiePerTarget,
    manualDefensePerTarget,
    manualToughnessPerTarget,
    targetShotId,
    fortuneBonus,
  } = formState.data

  // Create form update helpers
  const updateField = useMemo(
    () => createFieldUpdater<AttackFormData>(dispatchForm),
    [dispatchForm]
  )
  const updateFields = useMemo(
    () => createFieldsUpdater<AttackFormData>(dispatchForm),
    [dispatchForm]
  )

  const calculateEffectiveAttackValue = useCallback(
    (
      _attacker?: Character,
      _weapons?: Weapon[],
      _allShots?: Shot[]
    ): number => {
      return parseInt(attackValue) || 0
    },
    [attackValue]
  )

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
      const updates = initializeAttackerProperties({
        attacker,
        encounterWeapons,
        encounter,
      })
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
    if (
      !attacker ||
      CS.isMook(attacker) ||
      !swerve ||
      !attackValue ||
      !defenseValue
    ) {
      updateFields({
        multiTargetResults: [],
        showMultiTargetResults: false,
        smackdown: "",
        finalDamage: "0",
      })
      return
    }

    const result = calculateNonMookDamageOutcome({
      attacker,
      swerve,
      attackValue,
      defenseValue,
      weaponDamage,
      fortuneBonus,
      selectedTargetIds,
      allShots,
      targetMookCount,
      targetMookCountPerTarget,
      manualDefensePerTarget,
      manualToughnessPerTarget,
      encounter,
      calculateEffectiveAttackValue,
    })

    updateFields({
      multiTargetResults: result.multiTargetResults,
      showMultiTargetResults: result.showMultiTargetResults,
      smackdown: result.smackdown,
      finalDamage: result.finalDamage,
    })
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
    manualToughnessPerTarget,
    encounter,
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
      if (targetIds.length === 0) {
        updateFields({
          defenseValue: "0",
          toughnessValue: "0",
          manualDefensePerTarget: {},
        })
        return
      }

      const { defenseValue, toughnessValue } = getDefenseAndToughnessValues({
        targetIds,
        allShots,
        attacker,
        stunt: includeStunt,
        defenseChoicePerTarget:
          overrideDefenseChoices || defenseChoicePerTarget,
        fortuneDiePerTarget: overrideFortuneDice || fortuneDiePerTarget,
        manualDefensePerTarget: overrideManualDefense || manualDefensePerTarget,
        manualToughnessPerTarget,
        targetMookCount,
        targetMookCountPerTarget,
        encounter,
      })

      updateFields({
        defenseValue,
        toughnessValue,
      })
    },
    [
      allShots,
      attacker,
      defenseChoicePerTarget,
      encounter,
      fortuneDiePerTarget,
      manualDefensePerTarget,
      manualToughnessPerTarget,
      targetMookCount,
      targetMookCountPerTarget,
      updateFields,
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
    resetOnAttackerChange(updateFields, allShots, attackerShotId, CS)
  }, [attackerShotId, allShots, updateFields])

  useEffect(() => {
    const newDefenseValue = recalculateMookDefense({
      selectedTargetIds,
      attacker,
      allShots,
      targetMookCountPerTarget,
      stunt,
      manualDefensePerTarget,
      defenseChoicePerTarget,
      fortuneDiePerTarget,
      encounter,
    })

    if (newDefenseValue !== undefined) {
      updateField("defenseValue", newDefenseValue)
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
  ])

  // Track previous target IDs to detect actual target changes
  const prevTargetIdsRef = useRef<string[]>([])
  const prevStuntRef = useRef<boolean>(false)

  // Clear attack results when targets actually change (not when mook count changes)
  useEffect(() => {
    // Convert arrays to comparable strings for comparison
    const prevIds = [...prevTargetIdsRef.current].sort().join(",")
    const currentIds = [...selectedTargetIds].sort().join(",")
    const targetSelectionChanged = prevIds !== currentIds
    const stuntChanged = prevStuntRef.current !== stunt

    // Only reset attack results if target selection actually changed
    // Don't reset when only mook count or other defense values change
    if (targetSelectionChanged || stuntChanged) {
      resetAttackRelatedFields(updateFields)
    }

    // Update refs
    prevTargetIdsRef.current = selectedTargetIds
    prevStuntRef.current = stunt

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
      manualDefensePerTarget,
      manualToughnessPerTarget,
      encounter,
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
    manualDefensePerTarget,
    manualToughnessPerTarget,
    encounter,
    updateFields,
  ])

  const handleApplyDamage = async () => {
    updateField("isProcessing", true)
    let attackApplied = false

    try {
      const commonParams = {
        client,
        encounter,
        attackerShot: attackerShot!,
        attacker: attacker!,
        allShots,
        formStateData: formState.data,
        selectedTargetIds,
        multiTargetResults,
        mookRolls,
        target,
        calculateTargetDefense,
        calculateEffectiveAttackValue,
        attackerWeapons,
        toastSuccess,
        toastInfo,
        toastError,
      }

      attackApplied =
        (await handleNonMookMultiTargetApplication(commonParams)) ||
        (await handleMookApplication(commonParams)) ||
        (await handleSingleTargetApplication(commonParams))

      if (attackApplied) {
        resetAttackPanelForm(updateFields)
        if (onComplete) onComplete()
      } else {
        toastError("No valid attack scenario found to apply damage.")
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
