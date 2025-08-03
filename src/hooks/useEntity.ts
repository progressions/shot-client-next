import { useToast, useClient } from "@/contexts"
import type { Entity } from "@/types"
import pluralize from "pluralize"
import { redirect } from "next/navigation"

export function useEntity(entity: entity, setEntity: (entity: Entity) => void) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const entityClass = entity.entity_class
  const name = entity.entity_class.toLowerCase()

  const pluralName = pluralize(name)
  const updateFunction = `update${entityClass}`
  const deleteFunction = `delete${entityClass}`
  const createFunction = `create${entityClass}`

  const updateEntity = async (updatedEntity: Entity) => {
    try {
      setEntity(updatedEntity)
      const formData = new FormData()
      const entityData = {
        ...updatedEntity,
      }
      formData.append(name, JSON.stringify(entityData))
      const response = await client[updateFunction](updatedEntity.id, formData)
      setEntity(response.data)
      toastSuccess(`${entityClass} updated successfully`)
    } catch (error) {
      toastError(`Error updating ${name}.`)
      console.error("Error updating entity:", error)
      throw new Error(error)
    }
  }

  const deleteEntity = async () => {
    if (!entity?.id) return
    if (!confirm(`Are you sure you want to delete the entity: ${entity.name}?`))
      return

    try {
      await client[deleteFunction](entity)
      redirect(`/${pluralName}`)
    } catch (error_) {
      console.error("Failed to delete entity:", error_)
      toastError("Failed to delete entity.")
    }
  }

  const createEntity = async (newEntity: Entity, image: File | null) => {
    const formData = new FormData()
    const entityData = { ...entity, ...newEntity, image: undefined }

    formData.set(name, JSON.stringify(entityData))
    if (image) {
      formData.append("image", image)
    }

    try {
      await client[createFunction](formData)
      toastSuccess(`${entityClass} created successfully`)
    } catch (error) {
      console.error("Error creating entity:", error.response.data.errors)
      toastError(`Error creating ${name}.`)
      throw error
    }
  }

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const updatedEntity = {
      ...entity,
      [event.target.name]: event.target.value,
    }
    await updateEntity(updatedEntity)
  }

  return { updateEntity, deleteEntity, createEntity, handleChange }
}
