"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, SiteDetail } from "@/components/sites"
import { FilterAccordion, GridView, SortControls } from "@/components/ui"
import type { FormStateData } from "@/components/sites/List"

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
              { value: "visible", label: "Visible" },
              { value: "hidden", label: "Hidden" },
              { value: "all", label: "All" },
            ],
          },
        ]}
        onFiltersUpdate={updateFilters}
        entity="Site"
        formState={formState}
        omit={["add", "site"]}
        title="Filters"
      />
      <SortControls
        route="/sites"
        isMobile={viewMode === "mobile"}
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="site"
            entities={formState.data.sites}
            handleDelete={() => {}}
            DetailComponent={SiteDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
