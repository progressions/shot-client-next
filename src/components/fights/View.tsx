"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType } from "@/reducers"
import { FightDetail, Table } from "@/components/fights"
import { GenericFilter, EntityFilters, GridView, SortControls } from "@/components/ui"
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
      <EntityFilters
        filters={{
          show_hidden: formState.data.filters.show_hidden || false,
        }}
        options={[
          {
            name: "show_hidden",
            label: "Show Hidden",
            defaultValue: false,
          },
        ]}
        onFiltersUpdate={updateFilters}
      />
      <SortControls
        isMobile={viewMode === "mobile"}
        validSorts={["name", "season", "session", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={
          <GenericFilter
            entity="Fight"
            formState={formState}
            onFiltersUpdate={updateFilters}
            omit={["add", "fight"]}
          />
        }
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
