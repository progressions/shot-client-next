import type { BaseEntity } from "./ui"
import type { Character } from "./character"
import type { Vehicle, Effect } from "./resources"

export type EncounterVehicle = Vehicle & {
  shot_id: string
  current_shot: number | string
}

export type EncounterCharacter = Character & {
  shot_id: string
  current_shot: number | string
}

export type Encounter = BaseEntity & {
  sequence: number
  description: string | null
  shots: Shot[]
  effects?: Effect[]
  character_ids?: string[]
  vehicle_ids?: string[]
  started_at: string | null
  ended_at: string | null
  image_url: string | null
}

export type Shot = {
  shot: number
  characters: Character[]
  vehicles: Vehicle[]
}
