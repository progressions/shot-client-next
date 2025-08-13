"use client"
import { useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, VehicleDetail } from "@/components/vehicles"
import { createFilterComponent, GridView, SortControls } from "@/components/ui"
import { filterConfigs } from "@/lib/filterConfigs"

type ViewProps = {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  const VehicleFilter = useMemo(
    () => createFilterComponent(filterConfigs["Vehicle"]),
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
        route="/vehicles"
        isMobile={viewMode === "mobile"}
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={
          <VehicleFilter
            onFiltersUpdate={updateFilters}
            omit={["add", "vehicle"]}
          />
        }
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="vehicle"
            entities={formState.data.vehicles}
            handleDelete={() => {}}
            DetailComponent={VehicleDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
