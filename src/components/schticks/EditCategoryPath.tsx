"use client"
import {
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
import { useCallback } from "react"
import { FormStateType, FormActions, useForm } from "@/reducers"

type FormStateData = {
  category: string | null
  path: string | null
  isPathsLoading: boolean
}

interface EditCategoryPathProps {
  schtick: Schtick
  updateSchtick: (data: Partial<Schtick>) => Promise<void>
  state: FormStateType<FormStateData>
}

export default function EditCategoryPath({
  schtick,
  updateEntity: updateSchtick,
  state,
}: EditCategoryPathProps) {
  const { client } = useClient()

  // local state
  const { formState, dispatchForm } = useForm<FormStateData>({
    category: schtick.category || null,
    path: schtick.path || null,
    errors: {},
    isPathsLoading: false,
  })
  const { category, path, isPathsLoading } = formState.data

  // external state for errors
  const { saving, errors } = state

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
    dispatchForm({ type: FormActions.UPDATE, name: "category", value })
    dispatchForm({ type: FormActions.UPDATE, name: "path", value: null })
    dispatchForm({ type: FormActions.SUBMIT })
    await updateSchtick({ ...schtick, category: value, path: null })
    dispatchForm({ type: FormActions.SUCCESS })
  }

  const handlePathChange = async (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "path", value })
    dispatchForm({ type: FormActions.SUBMIT })
    await updateSchtick({ ...schtick, path: value })
    dispatchForm({ type: FormActions.SUCCESS })
  }

  return (
    <Box sx={{ mt: 4 }}>
      <SectionHeader title="Category and Path">
        A <InfoLink href="/schticks" info="Schtick" /> belongs to a certain{" "}
        <InfoLink info="Category" /> and <InfoLink info="Path" />, which governs
        the style of the Schtick and determines future{" "}
        <InfoLink info="Advancement" /> choices.
      </SectionHeader>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <FormControl fullWidth error={!!errors.category}>
          <SchtickCategoryAutocomplete
            value={category || ""}
            onChange={handleCategoryChange}
            allowNone={false}
            disabled={saving}
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
              disabled={saving}
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
