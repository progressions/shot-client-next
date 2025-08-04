"use client"

import { Stack, Box } from "@mui/material"
import { FormActions, useForm } from "@/reducers"
import { useClient } from "@/contexts"
import { SchtickCategoryAutocomplete, SchtickPathAutocomplete, SchtickAutocomplete } from "@/components/autocomplete"
import { Autocomplete } from "@/components/ui"
import type { Schtick } from "@/types"
import { useCallback, useEffect } from "react"

type FormStateData = {
  schticks: Schtick[]
  schtick_id: string | null
  categories: string[]
  category: string | null
  paths: string[]
  path: string | null
}

type SchtickFilterProps = {
  setEntity: (schtick: Schtick) => void
  dispatch: React.Dispatch<FormStateData>
  omit: string[]
}

export default function SchtickFilter({
  setSchtickId,
  dispatch,
  omit = [],
    setEntity,
}: SchtickFilterProps) {
  const { client } = useClient()
  const { formState, dispatchForm } = useForm<FormStateData>({
    schticks: [],
    schtick_id: null,
    categories: [],
    category: null,
    paths: [],
    path: null,
  })
  const { schticks, schtick_id, categories, category, paths, path } =
    formState.data

  const fetchSchticks = useCallback(async () => {
    try {
      const response = await client.getSchticks({
        category: category,
        path: path,
        per_page: 100,
        sort: "name",
        order: "asc",
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "schticks",
        value: response.data.schticks || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "categories",
        value: response.data.categories || [],
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "paths",
        value: response.data.paths || [],
      })
    } catch (error) {
      console.error("Error fetching schticks:", error)
      return []
    }
  }, [client, category, path, dispatchForm])

  useEffect(() => {
    if (!dispatch) return
    // update the set of schticks outside the component
    dispatch({
      type: FormActions.UPDATE,
      name: "category",
      value: category,
    })
    dispatch({ type: FormActions.UPDATE, name: "category", value: category })
    dispatch({
      type: FormActions.UPDATE,
      name: "path",
      value: path,
    })
  }, [dispatch, category, path])

  useEffect(() => {
    fetchSchticks()
  }, [fetchSchticks])

  useEffect(() => {
    fetchSchticks()
      .catch(error => {
        console.error("Error in useEffect fetchSchticks:", error)
      })
      .then(() => {
        dispatchForm({
          type: FormActions.EDIT,
          name: "loading",
          value: false,
        })
      })
  }, [client, dispatchForm, fetchSchticks, category, path])

  const handleSchtickChange = (schtick: Schtick | null) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "schtick_id",
      value: schtick.id,
    })
    setEntity(schtick)
  }

  const handleCategoryChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "category", value })
  }

  const handlePathChange = (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "path", value })
  }

  const fetchCategories = async () => {
    const opts = categories.map(category => ({
      label: category,
      value: category,
    }))
    return Promise.resolve(opts)
  }

  const fetchPaths = async () => {
    const opts = paths.map(path => ({
      label: path,
      value: path,
    }))
    return Promise.resolve(opts)
  }

  return (
    <Box
      sx={{
        mb: 2,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ width: "100%" }}
      >
        {!omit.includes("category") && (
          <SchtickCategoryAutocomplete
            label="Category"
            value={category || ""}
            fetchOptions={fetchCategories}
            onChange={handleCategoryChange}
            allowNone={false}
          />
        )}
        {!omit.includes("path") && (
          <SchtickPathAutocomplete
            label="Path"
            value={path || ""}
            fetchOptions={fetchPaths}
            onChange={handlePathChange}
            allowNone={false}
          />
        )}
        {!omit.includes("schtick") && (
          <SchtickAutocomplete
            options={schticks.map(schtick => ({
              label: `${schtick.name} (${schtick.category || ""})`,
              value: schtick.id || "",
            }))}
            value={schtick_id || ""}
            onChange={handleSchtickChange}
            allowNone={false}
          />
        )}
      </Stack>
    </Box>
  )
}
