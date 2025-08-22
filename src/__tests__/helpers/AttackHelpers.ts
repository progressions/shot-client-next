import type { Person } from "@/types"
import { roll } from "./Helpers"

// Simplified attack helper for initial testing
// This will be expanded once we understand the current service APIs
export function expectAttack(
  attacker: Person,
  target: Person,
  dieRoll: number,
  stunt: boolean = false
) {
  // Basic structure for attack testing
  // Will be implemented with actual service calls once services are migrated
  const mockedRoll = roll(dieRoll)

  // Placeholder for attack calculation logic
  const outcome = dieRoll // + actionValue - defense - (stunt ? 2 : 0)

  return {
    attacker,
    target,
    dieRoll,
    stunt,
    outcome,
    mockedRoll,
  }
}

export function expectNoChanges(initialState: any, finalState: any) {
  // Utility to verify no changes occurred
  expect(finalState).toEqual(initialState)
}

export function expectAttackerUnharmed(
  initialAttacker: Person,
  finalAttacker: Person
) {
  // Verify attacker wasn't harmed
  expect(finalAttacker.action_values.Wounds).toEqual(
    initialAttacker.action_values.Wounds
  )
}

export function expectTargetUnharmed(
  initialTarget: Person,
  finalTarget: Person
) {
  // Verify target wasn't harmed
  expect(finalTarget.action_values.Wounds).toEqual(
    initialTarget.action_values.Wounds
  )
}
