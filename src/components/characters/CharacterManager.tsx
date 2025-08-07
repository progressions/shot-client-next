"use client"

import type { Entity } from "@/types"
import { ListManager } from "@/components/ui"

type CharacterManagerProperties = {
  icon: React.ReactNode
  title: string
  entity: Entity
  description: React.ReactNode
  updateEntity: (entity: Entity) => Promise<void>
}

export default function CharacterManager({
  icon,
  entity,
  title,
  description,
  updateEntity,
}: CharacterManagerProperties) {
  return (
    <ListManager
      icon={icon}
      parent={entity}
      title={title}
      description={description}
      updateParent={updateEntity}
      collectionName="characters"
      collection_ids="character_ids"
      manage={true}
    />
  )
}
