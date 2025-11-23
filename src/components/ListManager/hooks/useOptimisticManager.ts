import { useCallback } from "react"
import type { Fight } from "@/types"
import { filterConfigs } from "@/lib/filterConfigs"

interface AutocompleteOption {
  id: number
  name: string
}

interface UseOptimisticManagerProps {
  childEntities: AutocompleteOption[]
  setChildEntities: (entities: AutocompleteOption[]) => void
  optimisticUpdateRef: React.MutableRefObject<boolean>
  childIds: (string | number)[]
  onListUpdate?: (updatedEntity: Fight) => Promise<void>
  parentEntity: Fight
  childIdsKey: string
  childEntityName: keyof typeof filterConfigs
  setCurrentPage: (page: number) => void
}

export function useOptimisticManager({
  childEntities,
  setChildEntities,
  optimisticUpdateRef,
  childIds,
  onListUpdate,
  parentEntity,
  childIdsKey,
  childEntityName,
  setCurrentPage,
}: UseOptimisticManagerProps) {
  const handleAdd = useCallback(
    async (child: AutocompleteOption | string | null) => {
      if (
        child &&
        typeof child !== "string" &&
        !(childIds as (number | string)[]).includes(child.id)
      ) {
        // Mark that we're doing an optimistic update
        optimisticUpdateRef.current = true
        // Locally update childEntities
        const updatedEntities = [...childEntities, child]
        setChildEntities(updatedEntities)
        // Use the updated entities list to build the new IDs array
        const newChildIds = updatedEntities.map(entity => entity.id)
        try {
          await onListUpdate?.({ ...parentEntity, [childIdsKey]: newChildIds })
          setCurrentPage(1)
        } catch (error) {
          console.error(
            `Failed to add ${childEntityName.toLowerCase()}:`,
            error
          )
          // Revert local update on error
          optimisticUpdateRef.current = false
          setChildEntities(prev =>
            prev.filter(entity => entity.id !== child.id)
          )
        }
      }
    },
    [
      childIds,
      childEntities,
      onListUpdate,
      parentEntity,
      childIdsKey,
      childEntityName,
      setChildEntities,
      optimisticUpdateRef,
      setCurrentPage,
    ]
  )

  const handleDelete = useCallback(
    async (item: AutocompleteOption) => {
      // Mark that we're doing an optimistic update
      optimisticUpdateRef.current = true
      // Locally update childEntities
      const updatedEntities = childEntities.filter(
        entity => entity.id !== item.id
      )
      setChildEntities(updatedEntities)
      // Use the updated entities list to build the new IDs array
      const newChildIds = updatedEntities.map(entity => entity.id)
      try {
        await onListUpdate?.({ ...parentEntity, [childIdsKey]: newChildIds })
      } catch (error) {
        console.error(
          `Failed to delete ${childEntityName.toLowerCase()}:`,
          error
        )
        // Revert local update on error
        optimisticUpdateRef.current = false
        setChildEntities(prev => [
          ...prev,
          childEntities.find(entity => entity.id === item.id) || item,
        ])
      }
    },
    [
      childEntities,
      onListUpdate,
      parentEntity,
      childIdsKey,
      childEntityName,
      setChildEntities,
      optimisticUpdateRef,
    ]
  )

  return { handleAdd, handleDelete }
}
