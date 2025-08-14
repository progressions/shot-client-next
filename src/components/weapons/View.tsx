"use client"
import { useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, WeaponDetail } from "@/components/weapons"
import { WeaponFilter, GridView, SortControls } from "@/components/ui"
import type { FormStateData } from "@/components/weapons/List"

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
    [dispatchForm]
  )

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <SortControls
        route="/weapons"
        isMobile={viewMode === "mobile"}
        validSorts={[
          "name",
          "damage",
          "concealment",
          "reload_value",
          "created_at",
          "updated_at",
        ]}
        dispatchForm={dispatchForm}
        formState={formState}
        filter={
          <WeaponFilter
            formState={formState}
            omit={["add", "weapon"]}
            onFiltersUpdate={updateFilters}
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
