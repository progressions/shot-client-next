"use client"
import { useMemo, useCallback } from "react"
import { Box } from "@mui/material"
import { FormActions, FormStateType, FormStateAction } from "@/reducers"
import { Table, CampaignDetail } from "@/components/campaigns"
import { createFilterComponent, GridView, SortControls } from "@/components/ui"
import { filterConfigs } from "@/lib/filterConfigs"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  const CampaignFilter = useMemo(
    () => createFilterComponent(filterConfigs["Campaign"]),
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
          <CampaignFilter
            onFiltersUpdate={updateFilters}
            omit={["add", "campaign"]}
          />
        }
      >
        {viewMode === "mobile" ? (
          <GridView
            resourceName="campaign"
            entities={formState.data.campaigns}
            handleDelete={() => {}}
            DetailComponent={CampaignDetail}
          />
        ) : (
          <Table formState={formState} dispatchForm={dispatchForm} />
        )}
      </SortControls>
    </Box>
  )
}
