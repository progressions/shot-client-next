"use client"
import { useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType } from "@/reducers"
import { WeaponDetail, Table } from "@/components/weapons"
import { createFilterComponent, GridView, SortControls } from "@/components/ui"
import type { FormStateData } from "@/components/weapons/List"
import { filterConfigs } from "@/lib/filterConfigs"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateType<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  const WeaponFilter = useMemo(
    () => createFilterComponent(filterConfigs["Weapon"]),
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
        isMobile={viewMode === "mobile"}
        validSorts={["name", "season", "session", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={
          <WeaponFilter
            onFiltersUpdate={updateFilters}
            omit={["add", "weapon"]}
          />
        }
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="weapon"
            entities={formState.data.weapons}
            handleDelete={() => {}}
            DetailComponent={WeaponDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
