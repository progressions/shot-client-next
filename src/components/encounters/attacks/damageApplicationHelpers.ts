import type {
  Character,
  Encounter,
  Shot,
  Weapon,
  AttackFormData,
} from "@/types"
import { CS } from "@/services"
import type createClient from "@/lib/client/Client"
import {
  handleNonMookMultipleTargets,
  handleMookAttack,
  handleSingleTargetAttack,
} from "./attackHandlers"
import { MookRollResult } from "./mookAttackRolls" // Import MookRollResult

type Client = ReturnType<typeof createClient>
type ToastFunction = (msg: string) => void

interface DamageApplicationParams {
  client: Client
  encounter: Encounter
  attackerShot: Shot
  attacker: Character
  allShots: Shot[]
  formStateData: AttackFormData
  selectedTargetIds: string[]
  multiTargetResults: Array<{
    targetId: string
    targetName: string
    defense: number
    toughness: number
    wounds: number
  }>
  mookRolls: Array<{
    targetId: string
    targetName: string
    rolls: MookRollResult[] // Use MookRollResult here
  }>
  target: Character | undefined
  calculateTargetDefense: (target: Character, targetId: string) => number
  calculateEffectiveAttackValue: () => number
  attackerWeapons: Weapon[]
  toastSuccess: ToastFunction
  toastInfo: ToastFunction
  toastError: ToastFunction
}

export async function handleNonMookMultiTargetApplication({
  client,
  encounter,
  attackerShot,
  attacker,
  allShots,
  formStateData,
  multiTargetResults,
  selectedTargetIds,
  calculateTargetDefense,
  calculateEffectiveAttackValue,
  attackerWeapons,
  toastSuccess,
  toastInfo,
  toastError,
}: DamageApplicationParams): Promise<boolean> {
  const {
    shotCost,
    weaponDamage,
    attackValue,
    swerve,
    defenseValue,
    stunt,
    defenseChoicePerTarget,
    fortuneDiePerTarget,
    targetMookCount,
  } = formStateData

  if (
    !CS.isMook(attacker) &&
    selectedTargetIds.length > 0 &&
    multiTargetResults.length > 0
  ) {
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
      { data: formStateData }
    )
    return true
  }
  return false
}

export async function handleMookApplication({
  client,
  encounter,
  attackerShot,
  attacker,
  allShots,
  formStateData,
  mookRolls,
  selectedTargetIds,
  calculateEffectiveAttackValue,
  attackerWeapons,
  toastSuccess,
  toastError,
}: DamageApplicationParams): Promise<boolean> {
  const { shotCost, weaponDamage, finalDamage } = formStateData

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
      selectedTargetIds.length === 1 && finalDamage ? finalDamage : undefined
    )
    return true
  }
  return false
}

export async function handleSingleTargetApplication({
  client,
  encounter,
  attackerShot,
  attacker,
  target,
  formStateData,
  selectedTargetIds,
  toastSuccess,
  toastError,
}: DamageApplicationParams): Promise<boolean> {
  const {
    finalDamage,
    toughnessValue,
    shotCost,
    attackValue,
    defenseValue,
    swerve,
    weaponDamage,
    stunt,
  } = formStateData

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
      toastError,
      { data: formStateData }
    )
    return true
  }
  return false
}
