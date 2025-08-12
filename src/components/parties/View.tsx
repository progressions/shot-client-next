"use client"
import { useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, PartyDetail } from "@/components/parties"
import { createFilterComponent, GridView, SortControls } from "@/components/ui"
import { filterConfigs } from "@/lib/filterConfigs"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  const PartyFilter = useMemo(
    () => createFilterComponent(filterConfigs["Party"]),
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
        dispatchForm={dispatchForm}
        formState={formState}
        isMobile={viewMode === "mobile"}
        filter={<PartyFilter omit={["add"]} onFiltersUpdate={updateFilters} />}
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="party"
            entities={formState.data.parties}
            handleDelete={() => {}}
            DetailComponent={PartyDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
