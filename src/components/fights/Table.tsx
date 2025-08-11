"use client"
import { GridColDef } from "@mui/x-data-grid"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, FightLink } from "@/components/ui"
import { Avatar } from "@/components/avatars"
import { PaginationMeta, Fight } from "@/types"

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  fights: Fight[]
  drawerOpen: boolean
}

interface ViewProps {
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

const columns: GridColDef<Fight>[] = [
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
    width: 280,
    editable: false,
    sortable: true,
    renderCell: params => <FightLink fight={params.row} />,
  },
  {
    field: "season",
    headerName: "Season",
    type: "number",
    width: 80,
    editable: false,
  },
  {
    field: "session",
    headerName: "Session",
    type: "number",
    width: 80,
    editable: false,
  },
  {
    field: "created_at",
    headerName: "Created",
    type: "date",
    width: 110,
    editable: false,
  },
  {
    field: "started_at",
    headerName: "Started",
    type: "date",
    width: 100,
    editable: false,
  },
  {
    field: "ended_at",
    headerName: "Ended",
    type: "date",
    width: 100,
    editable: false,
  },
]

export default function View({ formState, dispatchForm }: ViewProps) {
  const { fights } = formState.data
  const rows = fights.map(fight => ({
    ...fight,
    started_at: fight.started_at ? new Date(fight.started_at) : null,
    ended_at: fight.ended_at ? new Date(fight.ended_at) : null,
    updated_at: new Date(fight.updated_at),
    created_at: new Date(fight.created_at),
  }))

  return (
    <BaseDataGrid
      formState={formState}
      dispatchForm={dispatchForm}
      columns={columns}
      rows={rows}
      sx={{ height: 700, maxHeight: 900 }}
    />
  )
}
