import { AxiosError } from "axios"
import type { BackendErrorResponse } from "@/types"
import { FormActions } from "@/reducers"

export function handleError(
  err: Error | AxiosError<BackendErrorResponse> | unknown,
  dispatchForm: (action: { type: FormActions; payload?: unknown }) => void
) {
  let errorMessage = "An unexpected error occurred"
  if (err instanceof AxiosError) {
    const backendError = err.response?.data as BackendErrorResponse
    if (backendError?.error) {
      errorMessage = backendError.error
    } else if (backendError?.errors) {
      errorMessage = Object.values(backendError.errors).flat().join(", ")
    } else if (backendError?.name) {
      errorMessage = backendError.name.join(", ")
    }
  } else if (err instanceof Error) {
    errorMessage = err.message
  }
  console.error("Error:", errorMessage, err)
  dispatchForm({ type: FormActions.ERROR, payload: errorMessage })
}
