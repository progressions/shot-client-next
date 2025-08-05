"use client"

import { ListManager } from "@/components/ui"

type VehicleManagerProperties = {
  icon: React.ReactNode
  title: string
  entity: Entity
  description: React.ReactNode
  updateEntity: (entity: Entity) => Promise<void>
}

export default function VehicleManager({
  icon,
  entity,
  title,
  description,
  updateEntity,
}: VehicleManagerProperties) {
  return (
    <ListManager
      icon={icon}
      entity={entity}
      title={title}
      description={description}
      updateEntity={updateEntity}
      collection="vehicles"
      collection_ids="vehicle_ids"
      manage={true}
    />
  )
}
