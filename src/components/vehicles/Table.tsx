"use client"
import { GridColDef } from "@mui/x-data-grid"
import { Box } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, FactionLink, VehicleLink } from "@/components/ui"
import { VS } from "@/services"
import { EntityAvatar } from "@/components/avatars"
import { VehiclesTableFormState } from "@/types/forms"

interface ViewProps {
  formState: FormStateType<VehiclesTableFormState>
  dispatchForm: (action: FormStateAction<VehiclesTableFormState>) => void
}

const columns: GridColDef<Vehicle>[] = [
  {
    field: "avatar",
    headerName: "",
    width: 70,
    editable: false,
    sortable: false,
    renderCell: params => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <EntityAvatar entity={params.row} />
      </Box>
    ),
  },
  {
    field: "name",
    headerName: "Name",
    width: 240,
    editable: false,
    sortable: true,
    renderCell: params => <VehicleLink vehicle={params.row} />,
  },
  {
    field: "type",
    headerName: "Type",
    width: 110,
    editable: false,
    renderCell: params => VS.type(params.row),
  },
  {
    field: "archtype",
    headerName: "Archetype",
    width: 140,
    editable: false,
    renderCell: params => VS.archetype(params.row),
  },
  {
    field: "faction",
    headerName: "Faction",
    width: 160,
    editable: false,
    renderCell: params => {
      const faction = VS.faction(params.row)
      if (faction) {
        return <FactionLink faction={faction} />
      }
      return null
    },
  },
  {
    field: "task",
    headerName: "Task",
    type: "boolean",
    width: 50,
    editable: false,
    renderCell: params => (VS.isTask(params.row) ? "Yes" : ""),
  },
  {
    field: "created_at",
    headerName: "Created",
    type: "date",
    width: 110,
    editable: false,
  },
]

export default function View({ formState, dispatchForm }: ViewProps) {
  const { vehicles } = formState.data
  const rows = vehicles.map(vehicle => ({
    ...vehicle,
    created_at: new Date(vehicle.created_at),
  }))

  return (
    <BaseDataGrid
      formState={formState}
      dispatchForm={dispatchForm}
      columns={columns}
      rows={rows}
    />
  )
}
