"use client"
import {
  Stack,
  FormControl,
  FormHelperText,
  Box,
  CircularProgress,
  Typography,
  Divider,
} from "@mui/material"
import { InfoLink, SectionHeader, StringAutocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useCallback, useEffect } from "react"
import { useForm, FormActions } from "@/reducers"
import type { Schtick } from "@/types"

type FormStateData = {
  category: string | null
  path: string | null
  isPathsLoading: boolean
}

interface EditCategoryPathProps {
  schtick: Schtick
  updateEntity?: (entity: Schtick) => Promise<void> // Optional for forms
  setEntity?: (entity: Schtick) => void // For form mode
  state?: { saving: boolean; errors: Record<string, string> } // Optional for forms
  errors?: Record<string, string> // For form mode
}

export default function EditCategoryPath({
  schtick,
  updateEntity,
  setEntity,
  state,
  errors: formErrors,
}: EditCategoryPathProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    category: schtick.category || null,
    path: schtick.path || null,
    isPathsLoading: false,
  })
  const { category, path, isPathsLoading } = formState.data
  const isFormMode = !!setEntity
  const { saving, errors } = state || { saving: false, errors: {} }
  const actualErrors = formErrors || errors
  const [categories, setCategories] = useState<string[]>([])
  const [paths, setPaths] = useState<string[]>([])
  const [generalLength, setGeneralLength] = useState(0)

  const fetchCategories = useCallback(async () => {
    try {
      const response = await client.getSchtickCategories({ autocomplete: true })
      const general =
        response.data.general
          ?.filter((item: string | null) => item != null)
          .map(String) || []
      const core =
        response.data.core
          ?.filter((item: string | null) => item != null)
          .map(String) || []
      setCategories([...general, ...core])
      setGeneralLength(general.length)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }, [client])

  const fetchPaths = useCallback(
    async (inputValue: string): Promise<string[]> => {
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
        const fetchedPaths =
          response.data.paths
            ?.filter((item: string | null) => item != null)
            .map(String) || []
        setPaths(fetchedPaths)
        return fetchedPaths
      } catch (error) {
        console.error("Error fetching paths:", error)
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
    // Always update internal state
    dispatchForm({ type: FormActions.UPDATE, name: "category", value })
    dispatchForm({ type: FormActions.UPDATE, name: "path", value: null })

    if (isFormMode && setEntity) {
      // Form mode: just update the parent entity, no server calls
      setEntity({ ...schtick, category: value, path: null })
    } else if (updateEntity) {
      // Edit mode: save to server
      dispatchForm({ type: FormActions.SUBMIT })
      try {
        await updateEntity({ ...schtick, category: value, path: null })
        dispatchForm({ type: FormActions.SUCCESS })
      } catch {
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Failed to update category",
        })
      }
    }
  }

  const handlePathChange = async (value: string | null) => {
    // Always update internal state
    dispatchForm({ type: FormActions.UPDATE, name: "path", value })

    if (isFormMode && setEntity) {
      // Form mode: just update the parent entity, no server calls
      setEntity({ ...schtick, category, path: value })
    } else if (updateEntity) {
      // Edit mode: save to server
      dispatchForm({ type: FormActions.SUBMIT })
      try {
        await updateEntity({ ...schtick, path: value })
        dispatchForm({ type: FormActions.SUCCESS })
      } catch {
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Failed to update path",
        })
      }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    if (category) {
      fetchPaths("")
    } else {
      setPaths([])
    }
  }, [category, fetchPaths])

  // Sync local state with schtick prop changes from WebSocket
  useEffect(() => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "category",
      value: schtick.category || null,
    })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "path",
      value: schtick.path || null,
    })
  }, [schtick.category, schtick.path, dispatchForm])

  return (
    <Box sx={{ mt: 4 }}>
      <SectionHeader title="Category and Path">
        A <InfoLink href="/schticks" info="Schtick" /> belongs to a certain{" "}
        <InfoLink info="Category" /> and <InfoLink info="Path" />, which governs
        the style of the Schtick and determines future{" "}
        <InfoLink info="Advancement" /> choices.
      </SectionHeader>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <FormControl fullWidth error={!!actualErrors.category}>
          <StringAutocomplete
            model="Category"
            value={category || ""}
            onChange={handleCategoryChange}
            records={categories}
            sx={{ width: "100%" }}
            allowNone={false}
            disabled={isFormMode ? false : saving}
            groupBy={option =>
              categories.indexOf(option.id as string) < generalLength
                ? "General"
                : "Core"
            }
            renderGroup={params => (
              <Box key={params.key}>
                <Typography
                  variant="subtitle2"
                  sx={{ px: 2, py: 1, fontWeight: "bold" }}
                >
                  {params.group}
                </Typography>
                {params.children}
                {params.group === "General" && <Divider sx={{ my: 1 }} />}
              </Box>
            )}
          />
          {actualErrors.category && (
            <FormHelperText>{actualErrors.category}</FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth error={!!actualErrors.path}>
          {isPathsLoading ? (
            <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 2, color: "#ffffff" }}>
                Loading paths...
              </Typography>
            </Box>
          ) : category ? (
            <StringAutocomplete
              model="Path"
              value={path || ""}
              onChange={handlePathChange}
              records={paths}
              sx={{ width: "100%" }}
              allowNone={false}
              disabled={isFormMode ? false : saving}
            />
          ) : (
            <Typography variant="body2" sx={{ color: "#ffffff" }}>
              Select a category first
            </Typography>
          )}
          {actualErrors.path && (
            <FormHelperText>{actualErrors.path}</FormHelperText>
          )}
        </FormControl>
      </Stack>
    </Box>
  )
}
