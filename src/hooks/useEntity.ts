import { useToast, useClient } from "@/contexts"
import type { Entity } from "@/types"
import pluralize from "pluralize"
import { redirect } from "next/navigation"
import { FormActions } from "@/reducers"

/*********
 * expects a formState with the following structure:
 *
 * {
 *   data: {
 *     entity: Entity,
 *     ...
 *   },
 *   loading: boolean,
 *   errors: Record<string, string>,
 *   status: {
 *     severity: "error" | "success",
 *     message: string
 *   }
 *    ...
 *  }
 *
 *********/

export function useEntity(
  entity: entity,
  dispatchForm: React.Dispatch<FormActions>
) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const entityClass = entity.entity_class
  const name = entity.entity_class.toLowerCase()

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
        value: updatedEntity,
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

  const deleteEntity = async (params = {}) => {
    if (!entity?.id) return
    if (!confirm(`Are you sure you want to delete the entity: ${entity.name}?`))
      return

    try {
      await client[deleteFunction](entity, params)
      redirect(`/${pluralName}`)
    } catch (error) {
      console.error("Failed to delete entity:", error)
      toastError("Failed to delete entity.")
      throw error
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

  const handleChangeAndSave = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedEntity = {
      ...entity,
      [event.target.name]: event.target.value,
    }
    console.log("updatedEntity.faction_id", updatedEntity.faction_id)
    await updateEntity(updatedEntity)
  }

  const handleFormErrors = (error: unknown) => {
    const axiosError = error as AxiosError<ServerErrorResponse>
    if (axiosError.response?.status === 422) {
      const serverErrors = axiosError.response.data.errors
      const formattedErrors: FormStateData["errors"] = {}
      Object.entries(serverErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          formattedErrors[field as keyof FormStateData] = messages[0]
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
