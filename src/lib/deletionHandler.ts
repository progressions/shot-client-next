import { AxiosError } from "axios"
import type { ConfirmOptions } from "@/types/ui"

export interface DeletionConstraint {
  count: number
  label: string
}

export interface UnifiedDeletionError {
  error_type: "associations_exist"
  entity_type: string
  entity_id: string
  constraints: Record<string, DeletionConstraint>
  suggestions: string[]
}

export function isDeletionConstraintError(
  error: unknown
): error is AxiosError<UnifiedDeletionError> {
  if (!error || typeof error !== "object") return false

  const axiosError = error as AxiosError
  if (!axiosError.response?.data) return false

  const data = axiosError.response.data as { error_type?: string }
  return data.error_type === "associations_exist"
}

export function formatConstraintMessage(
  constraints: Record<string, DeletionConstraint>
): string {
  const items = Object.entries(constraints)
    .filter(([_, constraint]) => constraint.count > 0)
    .map(([_, constraint]) => `${constraint.count} ${constraint.label}`)

  if (items.length === 0) return ""
  if (items.length === 1) return items[0]
  if (items.length === 2) return items.join(" and ")

  const lastItem = items.pop()
  return `${items.join(", ")}, and ${lastItem}`
}

/**
 * Handles entity deletion with confirmation dialogs and constraint handling.
 * Shows initial confirmation, handles association errors, and offers force deletion.
 *
 * @param entity - Entity to delete (must have id, optionally name)
 * @param deleteFunction - API function to call for deletion
 * @param options - Configuration options
 * @param options.entityName - Display name for messages (e.g., "character")
 * @param options.onSuccess - Callback after successful deletion
 * @param options.onError - Callback with error message on failure
 * @param options.confirmMessage - Optional custom confirmation message
 * @param options.confirm - Async confirm function from useConfirm() hook
 *
 * @example
 * ```tsx
 * const { confirm } = useConfirm()
 *
 * await handleEntityDeletion(
 *   character,
 *   (entity, params) => client.deleteCharacter(entity.id, params),
 *   {
 *     entityName: "character",
 *     onSuccess: () => {
 *       router.push("/characters")
 *       toastSuccess("Character deleted")
 *     },
 *     onError: (msg) => toastError(msg),
 *     confirm,
 *   }
 * )
 * ```
 */
export async function handleEntityDeletion<
  T extends { id: string; name?: string },
>(
  entity: T,
  deleteFunction: (entity: T, params?: { force?: boolean }) => Promise<void>,
  options: {
    entityName: string
    onSuccess: () => void
    onError: (message: string) => void
    confirmMessage?: string
    confirm: (options: ConfirmOptions | string) => Promise<boolean>
  }
): Promise<void> {
  const { entityName, onSuccess, onError, confirmMessage, confirm } = options

  // Initial confirmation
  const entityLabel = entity.name || entity.id
  const message =
    confirmMessage ||
    `Are you sure you want to delete ${entityName}: ${entityLabel}?`

  const confirmed = await confirm({
    title: `Delete ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
    message,
    confirmText: "Delete",
    destructive: true,
  })
  if (!confirmed) return

  try {
    await deleteFunction(entity)
    onSuccess()
  } catch (error) {
    if (isDeletionConstraintError(error)) {
      const errorData = error.response!.data
      const constraintMessage = formatConstraintMessage(errorData.constraints)

      // Show detailed error and offer force deletion
      const forceConfirmed = await confirm({
        title: `Force Delete ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}?`,
        message: `This ${errorData.entity_type} has associated records:\n\n${constraintMessage}\n\nDo you want to delete it anyway?`,
        confirmText: "Force Delete",
        destructive: true,
      })

      if (forceConfirmed) {
        try {
          await deleteFunction(entity, { force: true })
          onSuccess()
        } catch (forceError) {
          console.error("Force deletion failed:", forceError)
          onError(`Failed to delete ${entityName}`)
        }
      }
    } else {
      // Non-constraint error
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to delete ${entityName}`
      onError(errorMessage)
      console.error("Delete error:", error)
    }
  }
}
