"use client"
import { Entity } from "@/types"
import { FormActions, UseFormReturn } from "@/reducers"

type UseListManagerProps<T extends Entity> = {
  entity: T
  update: (entity: T) => Promise<void>
  collectionKey: keyof T & string
  formState: { id?: string | null; itemIds: string[] }
  dispatchForm: UseFormReturn<{ id?: string | null; itemIds: string[] }>["dispatchForm"]
}

export function useListManager<T extends Entity>({ entity, update, collectionKey, formState, dispatchForm }: UseListManagerProps<T>) {
  const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === "string")
  }

  const handleAddItem = async () => {
    if (!formState.id) return
    try {
      const entityData = {
        ...entity,
        [`${collectionKey}_ids`]: [...formState[`${collectionKey}_ids`], formState.id],
      }
      await update(entityData)
      dispatchForm({ type: FormActions.UPDATE, name: "id", value: null })
    } catch (error) {
      console.error(`Error adding ${collectionKey} item:`, error)
      alert(`Failed to add ${collectionKey} item. Please try again.`)
    }
  }

  const handleDelete = async (item: T) => {
    if (!isStringArray(formState.itemIds)) {
      alert("Invalid items data.")
      return
    }
    try {
      let found = false
      const updatedIds = formState.itemIds.filter((itemId: string) => {
        if (itemId === item.id && !found) {
          found = true
          return false
        }
        return true
      })
      const entityData = { ...entity, [`${collectionKey}_ids`]: updatedIds }
      await update(entityData)
    } catch (error) {
      console.error(`Error removing ${collectionKey} item:`, error)
      alert(`Failed to remove ${collectionKey} item.`)
    }
  }

  return {
    handleAddItem,
    handleDelete,
  }
}
