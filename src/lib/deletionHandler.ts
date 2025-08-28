import { AxiosError } from "axios"

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

  const data = axiosError.response.data as any
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

export async function handleEntityDeletion<
  T extends { id: string; name?: string },
>(
  entity: T,
  deleteFunction: (entity: T, params?: any) => Promise<any>,
  options: {
    entityName: string
    onSuccess: () => void
    onError: (message: string) => void
    confirmMessage?: string
  }
): Promise<void> {
  const { entityName, onSuccess, onError, confirmMessage } = options

  // Initial confirmation
  const entityLabel = entity.name || entity.id
  const message =
    confirmMessage ||
    `Are you sure you want to delete ${entityName}: ${entityLabel}?`

  if (!confirm(message)) return

  try {
    await deleteFunction(entity)
    onSuccess()
  } catch (error) {
    if (isDeletionConstraintError(error)) {
      const errorData = error.response!.data
      const constraintMessage = formatConstraintMessage(errorData.constraints)

      // Show detailed error and offer force deletion
      const forceMessage = `This ${errorData.entity_type} has associated records:\n\n${constraintMessage}\n\nDo you want to delete it anyway?`

      if (confirm(forceMessage)) {
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
