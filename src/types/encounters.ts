import { BaseEntity } from "@/types"

export interface ShotDetails {
  id: string
  name: string
  entity_class: "Character" | "Vehicle"
  color: string | null
  count: number
  impairments: number
  action_values: Record<string, number>
}

export interface Shot {
  shot: number
  shot_details: ShotDetails[]
}

export interface Encounter extends BaseEntity {
  id: string
  name: string
  sequence: number
  description: string | null
  shots: Shot[]
  entity_class: string
}
