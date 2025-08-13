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
import { InfoLink, SectionHeader } from "@/components/ui"
import { createStringAutocomplete } from "@/components/ui"
import { useClient } from "@/contexts"
import { useState, useCallback, useEffect } from "react"
import { useForm, FormActions } from "@/reducers"
import type { Schtick } from "@/types"

interface Schtick {
  category?: string | null
  path?: string | null
}

interface AutocompleteOption {
  id: number | string
  name: string
  group?: string
}

type FormStateData = {
  category: string | null
  path: string | null
  isPathsLoading: boolean
}

interface EditCategoryPathProps {
  schtick: Schtick
  updateEntity: (entity: Schtick) => Promise<void>
  state: { saving: boolean; errors: Record<string, string> }
}

const CategoryAutocomplete = createStringAutocomplete("Category")
const PathAutocomplete = createStringAutocomplete("Path")

export default function EditCategoryPath({
  schtick,
  updateEntity,
  state,
}: EditCategoryPathProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    category: schtick.category || null,
    path: schtick.path || null,
    isPathsLoading: false,
  })
  const { category, path, isPathsLoading } = formState.data
  const { saving, errors } = state
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
    dispatchForm({ type: FormActions.UPDATE, name: "category", value })
    dispatchForm({ type: FormActions.UPDATE, name: "path", value: null })
    dispatchForm({ type: FormActions.SUBMIT })
    await updateEntity({ ...schtick, category: value, path: null })
    dispatchForm({ type: FormActions.SUCCESS })
  }

  const handlePathChange = async (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "path", value })
    dispatchForm({ type: FormActions.SUBMIT })
    await updateEntity({ ...schtick, path: value })
    dispatchForm({ type: FormActions.SUCCESS })
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
          <CategoryAutocomplete
            value={category || ""}
            onChange={handleCategoryChange}
            records={categories}
            sx={{ width: "100%" }}
            allowNone={false}
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
            <PathAutocomplete
              value={path || ""}
              onChange={handlePathChange}
              fetchOptions={fetchPaths}
              records={paths}
              sx={{ width: "100%" }}
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
