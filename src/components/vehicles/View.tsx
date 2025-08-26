"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, VehicleDetail } from "@/components/vehicles"
import {
  GenericFilter,
  EntityFilters,
  GridView,
  SortControls,
} from "@/components/ui"
import type { FormStateData } from "@/components/vehicles/List"

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
        route="/vehicles"
        isMobile={viewMode === "mobile"}
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={
          <GenericFilter
            entity="Vehicle"
            formState={formState}
            omit={["add", "vehicle"]}
            onFiltersUpdate={updateFilters}
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
