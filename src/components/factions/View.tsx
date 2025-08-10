"use client"
import { Box } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import { Table, FactionDetail } from "@/components/factions"
import { GridView, SortControls } from "@/components/ui"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

type FormStateData = {
  factions: Faction[]
  meta: PaginationMeta
  sort: string
  order: string
  faction_type: string
  archetype: string
}

interface Faction {
  id: string
  name: string
  type: string
  created_at: string
  active: boolean
}

interface PaginationMeta {
  current_page: number
  total_pages: number
}

export default function View({ viewMode, formState, dispatchForm }: ViewProps) {
  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <SortControls
        validSorts={["name", "created_at", "updated_at"]}
        isMobile={viewMode === "mobile"}
        formState={formState}
        dispatchForm={dispatchForm}
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
