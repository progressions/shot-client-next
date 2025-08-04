"use client"
import {
  Alert,
  Stack,
  FormControl,
  FormHelperText,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material"
import { SectionHeader } from "@/components/ui"
import { InfoLink } from "@/components/links"
import {
  SchtickCategoryAutocomplete,
  SchtickPathAutocomplete,
} from "@/components/autocomplete"
import { useClient } from "@/contexts"
import type { Schtick, SchtickPath } from "@/types"
import { useEffect, useCallback } from "react"
import { FormActions, useForm } from "@/reducers"
import type { AxiosError } from "axios"

interface ServerErrorResponse {
  errors: Partial<Record<keyof FormStateData, string[]>>
}

type FormStateData = {
  category: string | null
  path: string | null
  errors: Partial<Record<"category" | "path", string>>
  isPathsLoading: boolean
}

interface EditCategoryPathProps {
  schtick: Schtick
  updateSchtick: (data: Partial<Schtick>) => Promise<void>
}

export default function EditCategoryPath({
  schtick,
  updateSchtick,
}: EditCategoryPathProps) {
  const { client } = useClient()
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    category: schtick.category || null,
    path: schtick.path || null,
    errors: {},
    isPathsLoading: false,
  })
  console.log("formState", formState)
  const { data, disabled, error } = formState
  const { category, path, errors, isPathsLoading } = data

  useEffect(() => {
    dispatchForm({
      type: FormActions.RESET,
      payload: initialFormState,
    })
  }, [schtick, dispatchForm])

  const fetchPaths = useCallback(
    async (inputValue: string): Promise<Option[]> => {
      dispatchForm({
        type: FormActions.EDIT,
        name: "isPathsLoading",
        value: true,
      })
      try {
        const response = await client.getSchtickPaths({
          search: inputValue,
          category: category,
        })
        return response.data.paths.map((path: SchtickPath) => ({
          label: path || "",
          value: path || "",
        }))
      } catch (error) {
        console.error("Error fetching options:", error)
        return []
      } finally {
        dispatchForm({
          type: FormActions.EDIT,
          name: "isPathsLoading",
          value: false,
        })
      }
    },
    [category, client, dispatchForm]
  )

  const handleCategoryChange = async (value: string | null) => {
    console.log("handleCategoryChange called with value:", value)
    dispatchForm({ type: FormActions.UPDATE, name: "category", value })
    dispatchForm({ type: FormActions.UPDATE, name: "path", value: null })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "errors",
      value: { ...errors, category: undefined, path: undefined },
    })
    dispatchForm({ type: FormActions.SUBMIT })
    try {
      await updateSchtick({ ...schtick, category: value, path: null })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "errors",
        value: {},
      })
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      console.log("Axios error in handleCategoryChange:", {
        status: axiosError.status,
        responseStatus: axiosError.response?.status,
      })
      if (axiosError.response?.status === 422) {
        const serverErrors = axiosError.response?.data?.errors || {}
        console.log("Server errors:", serverErrors)
        const formattedErrors: FormStateData["errors"] = {}
        Object.entries(serverErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            formattedErrors[field as keyof FormStateData] = messages[0]
          }
        })
        console.log("Formatted errors:", formattedErrors)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "errors",
          value: formattedErrors,
        })
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Please correct the errors in the form",
        })
        console.log("formState after dispatch:", formState)
      } else {
        console.log("error status:", axiosError.status)
        dispatchForm({
          type: FormActions.ERROR,
          payload: "An unexpected error occurred",
        })
      }
      console.error("EditCategoryPath", error)
    } finally {
      dispatchForm({ type: FormActions.SUBMIT })
    }
  }

  const handlePathChange = async (value: string | null) => {
    console.log("handlePathChange called with value:", value)
    dispatchForm({ type: FormActions.UPDATE, name: "path", value })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "errors",
      value: { ...errors, path: undefined },
    })
    dispatchForm({ type: FormActions.SUBMIT })
    try {
      await updateSchtick({ ...schtick, path: value })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "errors",
        value: {},
      })
    } catch (error) {
      const axiosError = error as AxiosError<ServerErrorResponse>
      console.log("Axios error in handlePathChange:", {
        status: axiosError.status,
        responseStatus: axiosError.response?.status,
      })
      if (axiosError.response?.status === 422) {
        const serverErrors = axiosError.response?.data?.errors || {}
        console.log("Server errors:", serverErrors)
        const formattedErrors: FormStateData["errors"] = {}
        Object.entries(serverErrors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            formattedErrors[field as keyof FormStateData] = messages[0]
          }
        })
        console.log("Formatted errors:", formattedErrors)
        dispatchForm({
          type: FormActions.UPDATE,
          name: "errors",
          value: formattedErrors,
        })
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Please correct the errors in the form",
        })
        console.log("formState after dispatch:", formState)
      } else {
        console.log("error status:", axiosError.status)
        dispatchForm({
          type: FormActions.ERROR,
          payload: "An unexpected error occurred",
        })
      }
      console.error("EditCategoryPath", error)
    } finally {
      dispatchForm({ type: FormActions.SUBMIT })
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <SectionHeader title="Category and Path">
        A <InfoLink href="/schticks" info="Schtick" /> belongs to a certain{" "}
        <InfoLink info="Category" /> and <InfoLink info="Path" />, which governs
        the style of the Schtick and determines future{" "}
        <InfoLink info="Advancement" /> choices.
      </SectionHeader>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <FormControl fullWidth error={!!errors.category}>
          <SchtickCategoryAutocomplete
            value={category || ""}
            onChange={handleCategoryChange}
            allowNone={false}
          />
          {errors.category && (
            <FormHelperText>{errors.category}</FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth error={!!errors.path}>
          {isPathsLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 2, color: "#ffffff" }}>
                Loading paths...
              </Typography>
            </Box>
          ) : category ? (
            <SchtickPathAutocomplete
              value={path || ""}
              onChange={handlePathChange}
              fetchOptions={fetchPaths}
              allowNone={false}
            />
          ) : (
            <Typography variant="body2" sx={{ color: "#ffffff" }}>
              Select a category first
            </Typography>
          )}
          {errors.path && <FormHelperText>{errors.path}</FormHelperText>}
        </FormControl>
      </Stack>
    </Box>
  )
}
