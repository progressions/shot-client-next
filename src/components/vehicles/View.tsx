"use client"
import { Box } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import { Table, VehicleDetail } from "@/components/vehicles"
import { GridView, SortControls } from "@/components/ui"

interface ViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

type FormStateData = {
  vehicles: Vehicle[]
  meta: PaginationMeta
  sort: string
  order: string
  vehicle_type: string
  archetype: string
}

interface Vehicle {
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
        route="/vehicles"
        isMobile={viewMode === "mobile"}
        validSorts={["name", "created_at", "updated_at"]}
        dispatchForm={dispatchForm}
        formState={formState}
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
