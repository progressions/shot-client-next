import type { Vehicle, Swerve } from "@/types/types"

export enum ChaseMethod {
  RAM_SIDESWIPE = "RAM_SIDESWIPE",
  NARROW_THE_GAP = "NARROW_THE_GAP",
  WIDEN_THE_GAP = "WIDEN_THE_GAP",
  EVADE = "EVADE",
}

export type ChaseMookResult = {
  actionResult: number | null
  success: boolean
  smackdown: number
  chasePoints: number
  conditionPoints: number
}

export type ChaseFormData = {
  // Shot IDs for selection
  attackerShotId?: string
  targetShotId?: string
  
  // Vehicles
  attacker: Vehicle
  target: Vehicle
  
  // Vehicle stats (from attacker/target action_values)
  actionValue: number
  defense: number
  handling: number
  squeal: number
  frame: number
  crunch: number
  count: number
  impairments: number
  
  // Action configuration
  method: ChaseMethod
  swerve: Swerve
  typedSwerve: string
  stunt: boolean
  position: "near" | "far"
  attackerRole: "pursuer" | "evader"
  
  // Results (calculated by service)
  success: boolean
  actionResult: number | null
  outcome: number | null
  smackdown: number | null
  chasePoints: number | null
  conditionPoints: number | null
  mookResults: ChaseMookResult[]
  boxcars: boolean
  wayAwfulFailure: boolean
  
  // Display values (calculated)
  modifiedDefense: string
  modifiedActionValue: string
  mookDefense: number
  
  // UI control
  edited: boolean
}

export const initialChaseFormData: ChaseFormData = {
  attackerShotId: "",
  targetShotId: "",
  attacker: {} as Vehicle,
  target: {} as Vehicle,
  actionValue: 0,
  defense: 0,
  handling: 0,
  squeal: 0,
  frame: 0,
  crunch: 0,
  count: 1,
  impairments: 0,
  method: ChaseMethod.NARROW_THE_GAP,
  swerve: { result: 0, positive: 0, negative: 0, boxcars: false },
  typedSwerve: "",
  stunt: false,
  position: "far",
  success: false,
  actionResult: null,
  outcome: null,
  smackdown: null,
  chasePoints: null,
  conditionPoints: null,
  mookResults: [],
  boxcars: false,
  wayAwfulFailure: false,
  modifiedDefense: "",
  modifiedActionValue: "",
  mookDefense: 0,
  edited: false,
}