"use client"

/**
 * useEntity Hook
 *
 * Provides standardized CRUD operations for any entity type in the application.
 * Handles API calls, form state updates, toast notifications, and error handling.
 *
 * Works with the entity_class property to dynamically call the correct API methods.
 * Integrates with the form reducer pattern for state management.
 *
 * @module hooks/useEntity
 */

import { useToast } from "@/contexts/ToastContext"
import { useClient, useApp } from "@/contexts/AppContext"
import { useConfirm } from "@/contexts"
import type { Entity } from "@/types"
import pluralize from "pluralize"
import { FormActions } from "@/reducers"
import { useRouter } from "next/navigation"
import { handleEntityDeletion } from "@/lib/deletionHandler"
import { AxiosError } from "axios"

/**
 * Hook for CRUD operations on any entity type (Character, Campaign, Fight, etc.).
 * Provides standardized create, read, update, delete operations with toast notifications.
 *
 * @param entity - The entity instance to operate on (must have entity_class property)
 * @param dispatchForm - Dispatch function from useForm reducer for state updates
 *
 * @returns Object with entity operations:
 * - `getEntities(params?)` - Fetch list of entities
 * - `createEntity(entity, image)` - Create new entity with optional image
 * - `updateEntity(entity)` - Update existing entity
 * - `deleteEntity()` - Delete the entity and redirect to list
 * - `handleChangeAndSave(event)` - Handle input change and auto-save
 * - `handleFormErrors(error)` - Process API validation errors into form state
 *
 * @example
 * ```tsx
 * const { formState, dispatchForm } = useForm({ entity: character })
 * const { updateEntity, deleteEntity } = useEntity(character, dispatchForm)
 *
 * // Update character
 * await updateEntity({ ...character, name: "New Name" })
 *
 * // Delete character (redirects to /characters)
 * await deleteEntity()
 * ```
 */
export function useEntity(
  entity: Entity,
  dispatchForm: React.Dispatch<FormActions>
) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { confirm } = useConfirm()
  const { refreshUser } = useApp()
  const entityClass = entity.entity_class
  const name = entity.entity_class.toLowerCase()

  const router = useRouter()

  const pluralName = pluralize(name)
  const getFunction = `get${entityClass}`
  const updateFunction = `update${entityClass}`
  const deleteFunction = `delete${entityClass}`
  const createFunction = `create${entityClass}`

  const getEntities = async (params?: Record<string, unknown>) => {
    dispatchForm({ type: FormActions.EDIT, name: "loading", value: true })
    try {
      const response = await client[getFunction](params)
      return response.data
    } catch (error) {
      console.error(`Error fetching ${pluralName}:`, error)
      toastError(`Error fetching ${pluralName}.`)
      throw error
    }
    dispatchForm({ type: FormActions.EDIT, name: "loading", value: false })
  }

  const updateEntity = async (updatedEntity: Entity) => {
    dispatchForm({ type: FormActions.EDIT, name: "saving", value: true })
    try {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: { ...updatedEntity },
      })
      const formData = new FormData()
      const entityData = {
        ...updatedEntity,
      }
      formData.append(name, JSON.stringify(entityData))
      const response = await client[updateFunction](updatedEntity.id, formData)
      dispatchForm({
        type: FormActions.UPDATE,
        name: "entity",
        value: response.data,
      })
      dispatchForm({ type: FormActions.SUCCESS })
      toastSuccess(`${entityClass} updated successfully`)
    } catch (error) {
      handleFormErrors(error)
      toastError(`Error updating ${name}.`)
      console.error("Error updating entity:", error)
      throw error
    }
  }

  const deleteEntity = async () => {
    if (!entity?.id) return

    await handleEntityDeletion(
      entity,
      (entity, params) => client[deleteFunction](entity, params),
      {
        entityName: name,
        onSuccess: () => {
          router.push(`/${pluralName}`)
          toastSuccess(`${entityClass} deleted successfully`)
        },
        onError: message => {
          toastError(message)
        },
        confirm,
      }
    )
  }

  const createEntity = async (newEntity: Entity, image: File | null) => {
    const formData = new FormData()
    const {
      _tempImageFile,
      image: entityImage,
      ...cleanedEntity
    } = { ...entity, ...newEntity }
    const entityData = cleanedEntity

    formData.set(name, JSON.stringify(entityData))
    if (image) {
      formData.append("image", image)
    }

    try {
      const response = await client[createFunction](formData)
      toastSuccess(`${entityClass} created successfully`)

      // Refresh user data to update onboarding progress for milestone-tracked entities
      const milestoneEntities = [
        "character",
        "fight",
        "faction",
        "party",
        "site",
      ]
      if (milestoneEntities.includes(name)) {
        console.log(
          `🎯 Entity created: ${name} - calling refreshUser() to update onboarding progress`
        )
        await refreshUser()
      } else {
        console.log(
          `ℹ️ Entity created: ${name} - not a milestone entity, skipping refreshUser()`
        )
      }

      // Return the created entity data
      return response.data
    } catch (error) {
      console.error("Error creating entity:", error.response.data.errors)
      toastError(`Error creating ${name}.`)
      throw error
    }
  }

  const handleChangeAndSave = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedEntity = {
      ...entity,
      [event.target.name]: event.target.value,
    }
    await updateEntity(updatedEntity)
  }

  const handleFormErrors = (error: unknown) => {
    const axiosError = error as AxiosError<{ errors: Record<string, string[]> }>
    if (axiosError.response?.status === 422) {
      const serverErrors = axiosError.response.data.errors
      const formattedErrors: Record<string, string> = {}
      Object.entries(serverErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          formattedErrors[field] = messages[0]
        }
      })
      dispatchForm({
        type: FormActions.ERRORS,
        payload: formattedErrors,
      })
      dispatchForm({
        type: FormActions.STATUS,
        severity: "error",
        message: "Please correct the errors in the form",
      })
    } else {
      dispatchForm({
        type: FormActions.STATUS,
        severity: "error",
        message: "An unexpected error occurred",
      })
    }
    console.error(error)
  }

  return {
    getEntities,
    updateEntity,
    deleteEntity,
    createEntity,
    handleChangeAndSave,
    handleFormErrors,
  }
}
