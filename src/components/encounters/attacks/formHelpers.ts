import { FormActions } from "@/reducers"
import type { FormStateAction } from "@/reducers"

/**
 * Helper to create form update action
 */
export const createUpdateAction = <T>(name: keyof T, value: unknown): FormStateAction<T> => ({
  type: FormActions.UPDATE,
  name,
  value,
})

/**
 * Helper to update a single form field
 */
export const createFieldUpdater = <T>(dispatch: (action: FormStateAction<T>) => void) => {
  return (name: keyof T, value: unknown) => {
    dispatch(createUpdateAction(name, value))
  }
}

/**
 * Helper to update multiple form fields at once
 */
export const createFieldsUpdater = <T>(dispatch: (action: FormStateAction<T>) => void) => {
  return (updates: Partial<T>) => {
    Object.entries(updates).forEach(([name, value]) => {
      dispatch(createUpdateAction(name as keyof T, value))
    })
  }
}