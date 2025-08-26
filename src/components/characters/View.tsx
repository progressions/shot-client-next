"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, CharacterDetail } from "@/components/characters"
import {
  GenericFilter,
  EntityFilters,
  GridView,
  SortControls,
} from "@/components/ui"
import { useApp } from "@/contexts"
import type { FormStateData } from "@/components/characters/List"
import type { FilterOption } from "@/components/ui/filters/EntityFilters"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  const { user } = useApp()

  const updateFilters = useCallback(
    filters => {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "filters",
        value: {
          ...formState.data.filters,
          ...filters,
        },
      })
    },
    [dispatchForm, formState.data.filters]
  )

  // Build filter options based on user role
  const filterOptions: FilterOption[] = [
    {
      name: "visibility",
      label: "Visibility",
      type: "dropdown",
      defaultValue: "visible",
      options: [
        { value: "visible", label: "Visible" },
        { value: "hidden", label: "Hidden" },
        { value: "all", label: "All" },
      ],
    },
  ]

  // Add template filter for admin users only
  if (user?.admin) {
    filterOptions.push({
      name: "template_filter",
      label: "Template Filter",
      type: "dropdown",
      defaultValue: "non-templates",
      options: [
        { value: "non-templates", label: "Non-Templates Only" },
        { value: "templates", label: "Templates Only" },
        { value: "all", label: "All Characters" },
      ],
    })
  }

  // Build current filter values
  const currentFilters: Record<string, boolean | string> = {
    visibility:
      formState.data.filters.visibility ||
      (formState.data.filters.show_hidden === true ? "all" : "visible"),
  }

  // Add template_filter value if admin
  if (user?.admin) {
    currentFilters.template_filter =
      formState.data.filters.template_filter || "non-templates"
  }

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <EntityFilters
        filters={currentFilters}
        options={filterOptions}
        onFiltersUpdate={updateFilters}
      />
      <SortControls
        route="/characters"
        isMobile={viewMode === "mobile"}
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={
          <GenericFilter
            entity="Character"
            formState={formState}
            omit={["add", "character"]}
            onFiltersUpdate={updateFilters}
          />
        }
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="character"
            entities={formState.data.characters}
            handleDelete={() => {}}
            DetailComponent={CharacterDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
