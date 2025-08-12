"use client"
import { useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType } from "@/reducers"
import { SchtickDetail, Table } from "@/components/schticks"
import { createFilterComponent, GridView, SortControls } from "@/components/ui"
import type { FormStateData } from "@/components/schticks/List"
import { filterConfigs } from "@/lib/filterConfigs"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateType<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  const SchtickFilter = useMemo(
    () => createFilterComponent(filterConfigs["Schtick"]),
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
        validSorts={["name", "category", "path", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={
          <SchtickFilter onFiltersUpdate={updateFilters} omit={["add"]} />
        }
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="schtick"
            entities={formState.data.schticks}
            handleDelete={() => {}}
            DetailComponent={SchtickDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
