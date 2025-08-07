import type { Entity } from "@/types"
import { ListManager } from "@/components/ui"

type CharacterManagerProperties = {
  icon: React.ReactNode
  title: string
  entity: Entity
  description: React.ReactNode
  updateParent: (entity: Entity) => Promise<void>
}

export default function CharacterManager({
  icon,
  entity,
  title,
  description,
  updateParent,
}: CharacterManagerProperties) {
  return (
    <ListManager
      icon={icon}
      parent={entity}
      title={title}
      description={description}
      updateParent={updateParent}
      collectionName="characters"
      collection_ids="character_ids"
      manage={true}
    />
  )
}
