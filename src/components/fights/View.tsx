"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType } from "@/reducers"
import { FightDetail, Table } from "@/components/fights"
import { FightFilter, GridView, SortControls } from "@/components/ui"
import type { FormStateData } from "@/components/fights/List"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateType<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  console.log("View formState", formState)
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
        filter={
          <FightFilter
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
