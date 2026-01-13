"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, UserDetail } from "@/components/users"
import { FilterAccordion, GridView, SortControls } from "@/components/ui"
import type { FormStateData } from "@/components/users/List"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
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

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <FilterAccordion
        filters={{
          visibility:
            formState.data.filters.visibility ||
            (formState.data.filters.show_hidden === true ? "all" : "visible"),
          ...formState.data.filters,
        }}
        filterOptions={[
          {
            name: "visibility",
            label: "Visibility",
            type: "dropdown",
            defaultValue: "visible",
            options: [
              { value: "visible", label: "Active" },
              { value: "hidden", label: "Inactive" },
              { value: "all", label: "All" },
            ],
          },
          {
            name: "at_a_glance",
            label: "At a Glance",
            type: "checkbox",
            defaultValue: false,
          },
        ]}
        onFiltersUpdate={updateFilters}
        entity="User"
        formState={formState}
        omit={["add", "user"]}
        title="Filters"
      />
      <SortControls
        route="/users"
        isMobile={viewMode === "mobile"}
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="user"
            entities={formState.data.users}
            handleDelete={() => {}}
            DetailComponent={UserDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
