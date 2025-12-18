/**
 * useOptimisticManager Hook
 *
 * Provides optimistic add/delete handlers for child entity management.
 * Updates local state immediately, then syncs with server. Automatically
 * reverts on error.
 *
 * @module components/ListManager/hooks/useOptimisticManager
 */

import { useCallback } from "react"
import type { Fight } from "@/types"
import { filterConfigs } from "@/lib/filterConfigs"

interface AutocompleteOption {
  id: string
  name: string
}

/**
 * Props for the useOptimisticManager hook.
 *
 * @property childEntities - Current array of child entities
 * @property setChildEntities - State setter for child entities
 * @property optimisticUpdateRef - Ref to flag optimistic updates in progress
 * @property childIds - Current array of child entity IDs
 * @property onListUpdate - Callback to persist changes to parent entity
 * @property parentEntity - The parent Fight entity
 * @property childIdsKey - Property name for child IDs on parent (e.g., "character_ids")
 * @property childEntityName - Type of child entity
 * @property setCurrentPage - Pagination state setter
 * @property allowDuplicates - Allow adding the same entity multiple times (e.g., multiple instances of same enemy)
 */
interface UseOptimisticManagerProps {
  childEntities: AutocompleteOption[]
  setChildEntities: (entities: AutocompleteOption[]) => void
  optimisticUpdateRef: React.MutableRefObject<boolean>
  childIds: string[]
  onListUpdate?: (updatedEntity: Fight) => Promise<void>
  parentEntity: Fight
  childIdsKey: string
  childEntityName: keyof typeof filterConfigs
  setCurrentPage: (page: number) => void
  allowDuplicates?: boolean
}

/**
 * Hook providing optimistic add/delete handlers for child entities.
 *
 * Implements the optimistic update pattern:
 * 1. Update local state immediately for responsive UI
 * 2. Call server to persist changes
 * 3. Revert local state if server call fails
 *
 * @param props - Configuration props including entities, callbacks, and refs
 * @returns Object with handleAdd and handleDelete callbacks
 *
 * @example
 * ```tsx
 * const { handleAdd, handleDelete } = useOptimisticManager({
 *   childEntities,
 *   setChildEntities,
 *   optimisticUpdateRef,
 *   childIds,
 *   onListUpdate: updateFight,
 *   parentEntity: fight,
 *   childIdsKey: "character_ids",
 *   childEntityName: "Character",
 *   setCurrentPage,
 * })
 *
 * // Add a character
 * await handleAdd(selectedCharacter)
 *
 * // Remove a character
 * await handleDelete(characterToRemove)
 * ```
 */
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
  allowDuplicates = false,
}: UseOptimisticManagerProps) {
  const handleAdd = useCallback(
    async (child: AutocompleteOption | string | null) => {
      // Skip duplicate check if duplicates are allowed
      const isDuplicate =
        !allowDuplicates && childIds.includes(child?.id as string)
      if (child && typeof child !== "string" && !isDuplicate) {
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
      allowDuplicates,
    ]
  )

  const handleDelete = useCallback(
    async (item: AutocompleteOption) => {
      // Mark that we're doing an optimistic update
      optimisticUpdateRef.current = true

      // Locally update childEntities
      let updatedEntities: AutocompleteOption[]

      if (allowDuplicates) {
        // When duplicates are allowed, only remove the first matching instance
        const indexToRemove = childEntities.findIndex(
          entity => entity.id === item.id
        )
        if (indexToRemove !== -1) {
          updatedEntities = [
            ...childEntities.slice(0, indexToRemove),
            ...childEntities.slice(indexToRemove + 1),
          ]
        } else {
          updatedEntities = childEntities
        }
      } else {
        // Standard behavior: remove all with matching ID (should only be one)
        updatedEntities = childEntities.filter(entity => entity.id !== item.id)
      }

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
        setChildEntities(prev => [...prev, item])
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
      allowDuplicates,
    ]
  )

  return { handleAdd, handleDelete }
}
