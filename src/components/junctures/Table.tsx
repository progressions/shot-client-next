"use client"
import { GridColDef } from "@mui/x-data-grid"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, JunctureLink } from "@/components/ui"
import { Avatar } from "@/components/avatars"
import { PaginationMeta, Juncture } from "@/types"

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  junctures: Juncture[]
  drawerOpen: boolean
}

interface ViewProps {
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

const columns: GridColDef<Juncture>[] = [
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
    renderCell: params => <JunctureLink juncture={params.row} />,
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
  const { junctures } = formState.data
  const rows = junctures.map(juncture => ({
    ...juncture,
    created_at: new Date(juncture.created_at),
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
