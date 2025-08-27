"use client"
import { GridColDef } from "@mui/x-data-grid"
import { FightTableProps } from "@/types"
import { MembersGroup, BaseDataGrid, FightLink } from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"

const columns: GridColDef<Fight>[] = [
  {
    field: "avatar",
    headerName: "",
    width: 70,
    editable: false,
    sortable: false,
    renderCell: params => <EntityAvatar entity={params.row} />,
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
    field: "members",
    headerName: "Fighters",
    width: 150,
    editable: false,
    sortable: false,
    renderCell: params => (
      <MembersGroup
        items={params.row.characters || []}
        max={3}
        sx={{ mt: 1 }}
      />
    ),
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

export default function View({ formState, dispatchForm }: FightTableProps) {
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
