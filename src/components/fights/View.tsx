"use client"
import { useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType } from "@/reducers"
import { FightDetail, Table } from "@/components/fights"
import { createFilterComponent, GridView, SortControls } from "@/components/ui"
import type { FormStateData } from "@/components/fights/List"
import { filterConfigs } from "@/lib/filterConfigs"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateType<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  const FightFilter = useMemo(
    () => createFilterComponent(filterConfigs["Fight"]),
    []
  )

  const updateFilters = useCallback(
    filters => {
      console.log("Updating filters:", filters)
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
        isMobile={viewMode === "mobile"}
        validSorts={["name", "season", "session", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={<FightFilter onFiltersUpdate={updateFilters} omit={["add"]} />}
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
