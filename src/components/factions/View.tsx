"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, FactionDetail } from "@/components/factions"
import { GenericFilter, GridView, SortControls } from "@/components/ui"
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
      <SortControls
        route="/factions"
        isMobile={viewMode === "mobile"}
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={
          <GenericFilter
            entity="Faction"
            formState={formState}
            omit={["add", "faction"]}
            onFiltersUpdate={updateFilters}
          />
        }
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
