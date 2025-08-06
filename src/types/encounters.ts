import { Character, BaseEntity } from "@/types"

export type Encounter = BaseEntity & {
  sequence: number
  description: string | null
  shots: Shot[]
  started_at: string | null
  ended_at: string | null
  image_url: string | null
}

export type Shot = {
  shot: number
  characters: Character[]
  vehicles: Vehicle[]
}
