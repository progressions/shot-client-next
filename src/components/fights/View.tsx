"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType } from "@/reducers"
import { FightDetail, Table } from "@/components/fights"
import { FilterAccordion, GridView, SortControls } from "@/components/ui"
import type { FormStateData } from "@/components/fights/List"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateType<FormStateData>) => void
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
          {
            name: "at_a_glance",
            label: "At a Glance",
            type: "checkbox",
            defaultValue: false,
          },
        ]}
        onFiltersUpdate={updateFilters}
        entity="Fight"
        formState={formState}
        omit={["add", "fight"]}
        title="Filters"
      />
      <SortControls
        isMobile={viewMode === "mobile"}
        validSorts={["name", "season", "session", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="fight"
            entities={formState.data.fights}
            handleDelete={() => {}}
            DetailComponent={FightDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
