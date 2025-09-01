import type { Character, Shot, Weapon } from "./index"
import type { FormStateType, FormStateAction } from "@/reducers"

/**
 * Defense choice options for targets
 */
export type DefenseChoice = "none" | "dodge" | "fortune"

/**
 * Form data for attack resolution
 */
export interface AttackFormData {
  attackerShotId: string
  selectedTargetIds: string[]
  attackSkill: string
  attackValue: string
  selectedWeaponId: string
  weaponDamage: string
  swerve: string
  defenseValue: string
  toughnessValue: string
  outcome: string
  finalDamage: string
  stunt: boolean
  targetMookCount: number
  targetMookCountPerTarget: { [targetId: string]: number }
  shotCost: string
  isProcessing: boolean
  mookDistribution: { [targetId: string]: number }
  totalAttackingMooks: number
  mookRolls: MookTargetGroup[]
  showMookRolls: boolean
  defenseChoicePerTarget: { [targetId: string]: DefenseChoice }
  fortuneDiePerTarget: { [targetId: string]: string }
  defenseAppliedPerTarget: { [targetId: string]: boolean }
  manualDefensePerTarget: { [targetId: string]: string }
  manualToughnessPerTarget: { [targetId: string]: string }
  multiTargetResults: MultiTargetResult[]
  showMultiTargetResults: boolean
  targetShotId?: string
  [key: string]: unknown
}

/**
 * Result of attacking multiple targets
 */
export interface MultiTargetResult {
  targetId: string
  targetName: string
  defense?: number
  toughness?: number
  wounds: number
  killed?: boolean
}

/**
 * Individual mook attack roll
 */
export interface MookRoll {
  mookNumber: number
  swerve: number
  actionResult: number
  outcome: number
  hit: boolean
  wounds: number
}

/**
 * Group of mook attacks against a target
 */
export interface MookTargetGroup {
  targetId: string
  targetName: string
  rolls: MookRoll[]
}

/**
 * Props for AttackPanel component
 */
export interface AttackPanelProps {
  encounter: Record<string, unknown> // Replace with proper Encounter type when available
  encounterWeapons: { [key: string]: Weapon }
  onExpandChange?: (expanded: boolean) => void
}

/**
 * Props for AttackerSection component
 */
export interface AttackerSectionProps {
  sortedAttackerShots: Shot[]
  formState: FormStateType<AttackFormData>
  dispatchForm: (action: FormStateAction<AttackFormData>) => void
  attacker: Character | undefined
  attackerWeapons: Weapon[]
  allShots: Shot[]
  selectedTargetIds: string[]
}

/**
 * Props for TargetSection component
 */
export interface TargetSectionProps {
  allShots: Shot[]
  sortedTargetShots: Shot[]
  formState: FormStateType<AttackFormData>
  dispatchForm: (action: FormStateAction<AttackFormData>) => void
  attacker: Character | undefined
  attackerShotId: string
  updateField: (name: keyof AttackFormData, value: unknown) => void
  updateFields: (updates: Partial<AttackFormData>) => void
  updateDefenseAndToughness: (
    targetIds: string[],
    includeStunt: boolean
  ) => void
  distributeMooks: (targetIds: string[]) => void
  calculateTargetDefense: (target: Character, targetId: string) => number
}

/**
 * Props for TargetDefenseDisplay component
 */
export interface TargetDefenseDisplayProps {
  targetId: string
  allShots: Shot[]
  attacker: Character | undefined
  stunt: boolean
  targetMookCount: number
  targetMookCountPerTarget: { [targetId: string]: number }
  defenseChoicePerTarget: { [targetId: string]: DefenseChoice }
  fortuneDiePerTarget: { [targetId: string]: string }
  manualDefensePerTarget: { [targetId: string]: string }
  manualToughnessPerTarget: { [targetId: string]: string }
  selectedTargetIds: string[]
  calculateTargetDefense: (target: Character, targetId: string) => number
  updateField: (name: string, value: unknown) => void
  updateFields: (updates: Partial<AttackFormData>) => void
  updateDefenseAndToughness: (
    targetIds: string[],
    includeStunt: boolean
  ) => void
}

/**
 * Props for MookAttackSection component
 */
export interface MookAttackSectionProps {
  attacker: Character | undefined
  allShots: Shot[]
  selectedTargetIds: string[]
  mookRolls: MookTargetGroup[]
  showMookRolls: boolean
  totalAttackingMooks: number
  finalDamage: string
  shotCost: string
  attackValue: string
  isProcessing: boolean
  updateField: (name: string, value: unknown) => void
  handleRollMookAttacks: () => void
  handleApplyDamage: () => void
}

/**
 * Props for CombatResolution component
 */
export interface CombatResolutionProps {
  attacker: Character | undefined
  allShots: Shot[]
  selectedTargetIds: string[]
  swerve: string
  finalDamage: string
  shotCost: string
  showMultiTargetResults: boolean
  multiTargetResults: MultiTargetResult[]
  isProcessing: boolean
  updateField: (name: string, value: unknown) => void
  handleApplyDamage: () => void
}

/**
 * Props for AttackResults component
 */
export interface AttackResultsProps {
  attacker: Character | undefined
  attackerWeapons: Weapon[]
  allShots: Shot[]
  selectedTargetIds: string[]
  multiTargetResults: MultiTargetResult[]
  attackValue: string
  swerve: string
  defenseValue: string
  weaponDamage: string
  defenseChoicePerTarget: { [targetId: string]: DefenseChoice }
  calculateEffectiveAttackValue: (
    attacker: Character | undefined,
    weapons: Weapon[],
    allShots: Shot[]
  ) => number
  calculateTargetDefense: (target: Character, targetId: string) => number
}

/**
 * Props for WoundsSummary component
 */
export interface WoundsSummaryProps {
  multiTargetResults: MultiTargetResult[]
  allShots: Shot[]
  calculateTargetDefense: (target: Character, targetId: string) => number
  defenseChoicePerTarget: { [targetId: string]: DefenseChoice }
  selectedTargetIds: string[]
  attackValue: string
  swerve: string
  weaponDamage: string
  targetMookCount: number
  finalDamage: string
}
