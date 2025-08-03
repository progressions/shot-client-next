import { Box, Table } from "@mui/material"
import { VehiclesMobile, VehicleFilter } from "@/components/vehicles"
import { FormStateType, FormStateAction } from "@/reducers"
import {
  VehiclesTableHeader,
  VehiclesTableBody,
  VehiclesPagination,
} from "@/components/vehicles"

interface VehiclesViewProps {
  viewMode: "table" | "mobile"
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void
  onSortChange: (newSort: ValidSort) => void
  onOrderChange: () => void
  initialIsMobile: boolean
}

type ValidSort = "name" | "type" | "created_at" | "updated_at"

type FormStateData = {
  vehicles: Vehicle[]
  meta: PaginationMeta
  sort: string
  order: string
  vehicle_type: string
  archetype: string
  faction_id: string
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

export default function VehiclesView({
  viewMode,
  formState,
  dispatchForm,
  onPageChange,
  onSortChange,
  onOrderChange,
  initialIsMobile,
}: VehiclesViewProps) {
  const { vehicles, meta, sort } = formState.data

  const formatDate = (date: string) => {
    if (viewMode === "mobile") {
      const d = new Date(date)
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(-2)}`
    }
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      {viewMode === "mobile" ? (
        <VehiclesMobile
          formState={formState}
          dispatchForm={dispatchForm}
          onPageChange={onPageChange}
          onSortChange={onSortChange}
          onOrderChange={onOrderChange}
          initialIsMobile={initialIsMobile}
        />
      ) : (
        <>
          <VehicleFilter dispatch={dispatchForm} includeVehicles={false} />
          <Box sx={{ bgcolor: "#424242", borderRadius: 1 }}>
            <Table
              sx={{
                maxWidth: { xs: "400px", sm: "100%" },
                tableLayout: "fixed",
              }}
            >
              <VehiclesTableHeader
                sort={sort}
                order={formState.data.order}
                onSortChange={onSortChange}
              />
              <VehiclesTableBody vehicles={vehicles} formatDate={formatDate} />
            </Table>
          </Box>
          <VehiclesPagination meta={meta} onPageChange={onPageChange} />
        </>
      )}
    </Box>
  )
}
