"use client"
import { GridColDef } from "@mui/x-data-grid"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, SchtickLink } from "@/components/ui"
import { Avatar } from "@/components/avatars"
import { SchtickTableFormState } from "@/types/forms"

interface ViewProps {
  formState: FormStateType<SchtickTableFormState>
  dispatchForm: (action: FormStateAction<SchtickTableFormState>) => void
}

const columns: GridColDef<Schtick>[] = [
  {
    field: "avatar",
    headerName: "",
    width: 70,
    editable: false,
    sortable: false,
    renderCell: params => <Avatar entity={params.row} />,
  },
  {
    field: "name",
    headerName: "Name",
    width: 350,
    editable: false,
    sortable: true,
    renderCell: params => <SchtickLink schtick={params.row} />,
  },
  {
    field: "category",
    headerName: "Category",
    width: 250,
    editable: false,
    sortable: true,
  },
  {
    field: "path",
    headerName: "Path",
    width: 150,
    editable: false,
    sortable: true,
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
  const { schticks } = formState.data
  const rows = schticks.map(schtick => ({
    ...schtick,
    created_at: new Date(schtick.created_at),
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
