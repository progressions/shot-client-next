"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, FactionDetail } from "@/components/factions"
import { FilterAccordion, GridView, SortControls } from "@/components/ui"
import type { FormStateData } from "@/components/factions/List"

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
        entity="Faction"
        formState={formState}
        omit={["add", "faction"]}
        title="Filters"
      />
      <SortControls
        route="/factions"
        isMobile={viewMode === "mobile"}
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="faction"
            entities={formState.data.factions}
            handleDelete={() => {}}
            DetailComponent={FactionDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
