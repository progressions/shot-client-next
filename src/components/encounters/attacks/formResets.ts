import type { AttackFormData, Shot } from "@/types"
import { CS } from "@/services"

export function resetAttackPanelForm(
  updateFields: (updates: Partial<AttackFormData>) => void
) {
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
    mookDistribution: {},
    totalAttackingMooks: 0,
    mookRolls: [],
    showMookRolls: false,
    targetShotId: "",
  })
}

export function resetOnAttackerChange(
  updateFields: (updates: Partial<AttackFormData>) => void,
  allShots: Shot[],
  attackerShotId: string,
  _CS: typeof CS // CS service for character type checks
) {
  const currentAttacker = allShots.find(
    s => s.character?.shot_id === attackerShotId
  )?.character
  const totalMooks =
    currentAttacker && _CS.isMook(currentAttacker)
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
}

export function resetAttackRelatedFields(
  updateFields: (updates: Partial<AttackFormData>) => void
) {
  updateFields({
    swerve: "",
    finalDamage: "",
    mookRolls: [],
    showMookRolls: false,
    multiTargetResults: [],
    showMultiTargetResults: false,
  })
}
