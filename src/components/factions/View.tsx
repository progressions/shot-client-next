"use client"
import { useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, FactionDetail } from "@/components/factions"
import { createFilterComponent, GridView, SortControls } from "@/components/ui"
import { filterConfigs } from "@/lib/filterConfigs"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  const FactionFilter = useMemo(
    () => createFilterComponent(filterConfigs["Faction"]),
    []
  )

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
    [dispatchForm]
  )

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <SortControls
        validSorts={["name", "created_at", "updated_at"]}
        isMobile={viewMode === "mobile"}
        formState={formState}
        dispatchForm={dispatchForm}
        filter={
          <FactionFilter omit={["add"]} onFiltersUpdate={updateFilters} />
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
