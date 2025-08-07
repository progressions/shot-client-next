"use client"

import { ListManager } from "@/components/ui"

type VehicleManagerProperties = {
  icon: React.ReactNode
  title: string
  entity: Entity
  description: React.ReactNode
  updateParent: (entity: Entity) => Promise<void>
}

export default function VehicleManager({
  icon,
  entity,
  title,
  description,
  updateParent,
}: VehicleManagerProperties) {
  return (
    <ListManager
      icon={icon}
      parent={entity}
      title={title}
      description={description}
      updateParent={updateParent}
      collectionName="vehicles"
      collection_ids="vehicle_ids"
      manage={true}
    />
  )
}
