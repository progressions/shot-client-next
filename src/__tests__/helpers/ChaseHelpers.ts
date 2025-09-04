import type { Vehicle } from "@/types/types"
import { ChaseMethod, ChaseFormData, initialChaseFormData } from "@/types/chase"
import VS from "@/services/VehicleService"
import { pursuer, evader } from "@/__tests__/factories/Vehicles"
import CRS from "@/services/ChaseReducerService"
import { roll } from "@/__tests__/helpers/Helpers"

interface PartialChaseState {
  swerve: number
  actionValue?: number
  defense?: number
  handling?: number
  squeal?: number
  frame?: number
  crunch?: number
  chasePoints?: number
  conditionPoints?: number
  smackdown?: number
  outcome: number
  position?: string
  bump?: number
  mooks?: number
}

export function expectPursuitAttack(
  attacker: Vehicle,
  target: Vehicle,
  method: ChaseMethod,
  startingPosition: "near" | "far",
  dieRoll: number,
  stunt: boolean = false
) {
  let state = { ...initialChaseFormData }

  attacker = pursuer(attacker, startingPosition)
  target = evader(target, startingPosition)

  state = CRS.setAttacker(state, attacker)
  state = CRS.setTarget(state, target)
  state.method = method
  state.edited = true
  state.swerve = roll(dieRoll)

  const result = CRS.process(state)

  const toughness =
    method === ChaseMethod.RAM_SIDESWIPE ? state.frame : state.handling
  const damage =
    method === ChaseMethod.RAM_SIDESWIPE ? state.crunch : state.squeal
  const outcome = dieRoll + state.actionValue - state.defense - (stunt ? 2 : 0)
  const smackdown = outcome >= 0 ? outcome + damage : null
  const chasePoints = smackdown ? smackdown - toughness : 0
  const bump =
    outcome >= 0 &&
    method === ChaseMethod.RAM_SIDESWIPE &&
    Math.max(0, VS.frame(target) - VS.frame(attacker))

  expectChaseResults(state, result, {
    swerve: dieRoll,
    outcome: outcome,
    smackdown: smackdown as number,
    chasePoints: chasePoints as number,
    conditionPoints: (method === ChaseMethod.RAM_SIDESWIPE
      ? chasePoints
      : 0) as number,
    position: outcome >= 0 ? "near" : startingPosition,
    bump: bump as number,
  })
}

export function expectEvasionAttack(
  attacker: Vehicle,
  target: Vehicle,
  method: ChaseMethod,
  startingPosition: "near" | "far",
  dieRoll: number,
  stunt: boolean = false
) {
  let state = { ...initialChaseFormData }

  attacker = evader(attacker, startingPosition)
  target = pursuer(target, startingPosition)

  state = CRS.setAttacker(state, attacker)
  state = CRS.setTarget(state, target)
  state.method = method
  state.edited = true
  state.swerve = roll(dieRoll)

  const result = CRS.process(state)

  const toughness =
    method === ChaseMethod.RAM_SIDESWIPE ? state.frame : state.handling
  const damage =
    method === ChaseMethod.RAM_SIDESWIPE ? state.crunch : state.squeal
  const outcome = dieRoll + state.actionValue - state.defense - (stunt ? 2 : 0)
  const success = outcome >= 0
  const smackdown = success ? outcome + damage : null
  const chasePoints = smackdown ? smackdown - toughness : 0
  const bump =
    success &&
    method === ChaseMethod.RAM_SIDESWIPE &&
    Math.max(0, VS.frame(target) - VS.frame(attacker))
  let endingPosition = success ? "far" : startingPosition
  if (success && method === ChaseMethod.RAM_SIDESWIPE) endingPosition = "near"

  expectChaseResults(state, result, {
    swerve: dieRoll,
    outcome: outcome,
    smackdown: smackdown as number,
    chasePoints: chasePoints as number,
    conditionPoints: (method === ChaseMethod.RAM_SIDESWIPE
      ? chasePoints
      : 0) as number,
    position: endingPosition,
    bump: bump as number,
  })
}

export function expectTargetUnharmed(
  state: ChaseFormData,
  result: ChaseFormData
) {
  // the target has taken no damage
  expect(VS.chasePoints(result.target)).toEqual(VS.chasePoints(state.target))
  expect(VS.conditionPoints(result.target)).toEqual(
    VS.conditionPoints(state.target)
  )
}

export function expectAttackerUnharmed(
  state: ChaseFormData,
  result: ChaseFormData
) {
  if (VS.isMook(result.attacker)) {
    expect(VS.mooks(result.attacker)).toEqual(VS.mooks(state.attacker))
  }
  // the attacker has taken no damage
  expect(VS.chasePoints(result.attacker)).toEqual(
    VS.chasePoints(state.attacker)
  )
  expect(VS.conditionPoints(result.attacker)).toEqual(
    VS.conditionPoints(state.attacker)
  )
}

export function expectPositionsUnchanged(
  state: ChaseFormData,
  result: ChaseFormData
) {
  // their positions haven't changed
  expect(VS.position(result.attacker)).toEqual(VS.position(state.attacker))
  expect(VS.position(result.target)).toEqual(VS.position(state.target))
}

export function expectNoChanges(state: ChaseFormData, result: ChaseFormData) {
  expectAttackerUnharmed(state, result)
  expectTargetUnharmed(state, result)
  expectPositionsUnchanged(state, result)
}

export function expectChaseResults(
  state: ChaseFormData,
  result: ChaseFormData,
  values: PartialChaseState
) {
  const { swerve, outcome: _outcome } = values

  const smackdown = values.smackdown
  const chasePoints = values.chasePoints
  const conditionPoints = values.conditionPoints

  // attack values belong to the attacker
  const actionValue = values.actionValue || VS.mainAttackValue(state.attacker)
  const squeal = values.squeal || VS.squeal(state.attacker)
  const crunch = values.crunch || VS.crunch(state.attacker)

  // defense values belong to the target
  const defense = values.defense || VS.defense(state.target)
  const handling = values.handling || VS.handling(state.target)
  const frame = values.frame || VS.frame(state.target)

  const position = values.position || VS.position(state.attacker)

  // bump only applies on a sideswipe if the target's frame is higher than the attacker's
  const bump = values.bump || 0

  const mooks = values.mooks

  // console.log(`Swerve ${swerve} + Action Value ${actionValue} - Defense ${defense} = Outcome ${swerve + actionValue - defense}`)
  // console.log(`Outcome ${swerve + actionValue - defense} + Damage ${damage} - Toughness ${toughness} = Chase Points ${chasePoints}`)
  // console/log(`And Condition Points ${conditionPoints}`)

  expect(result.swerve.result).toEqual(swerve)
  expect(result.actionValue).toEqual(actionValue)
  expect(result.defense).toEqual(defense)

  if (mooks) {
    expect(VS.mooks(result.target)).toEqual(VS.mooks(state.target) - mooks)
  } else {
    expect(result.smackdown).toEqual(smackdown)

    expect(result.handling).toEqual(handling)
    expect(result.squeal).toEqual(squeal)
    expect(result.frame).toEqual(frame)
    expect(result.crunch).toEqual(crunch)

    // the state knows how much damage was dealt
    expect(result.chasePoints).toEqual(chasePoints || 0)
    expect(result.conditionPoints).toEqual(conditionPoints || 0)

    expect(VS.chasePoints(result.target)).toEqual(chasePoints)
    expect(VS.conditionPoints(result.target)).toEqual(conditionPoints)
  }

  expect(VS.position(result.attacker)).toEqual(position)
  expect(VS.position(result.target)).toEqual(position)

  expect(VS.chasePoints(result.attacker)).toEqual(bump)
  expect(VS.conditionPoints(result.attacker)).toEqual(bump)
}
