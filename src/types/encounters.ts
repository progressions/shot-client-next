import { BaseEntity } from "@/types"

interface Encounter extends BaseEntity {
  id: string
  entity_class: string
  name: string
  sequence: number
  description: string | null
  shots: [number, ShotDetail[]][]
}

interface ShotDetail {
  id: string
  name: string
  entity_class: string
  action_values: object
  color: string | null
  count: number
  impairments: number
}
