"use client"
import { GridColDef } from "@mui/x-data-grid"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, FactionLink, MembersGroup } from "@/components/ui"
import { Avatar } from "@/components/avatars"
import { FactionsTableFormState } from "@/types/forms"

interface ViewProps {
  formState: FormStateType<FactionsTableFormState>
  dispatchForm: (action: FormStateAction<FactionsTableFormState>) => void
}

const columns: GridColDef<Faction>[] = [
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
    renderCell: params => <FactionLink faction={params.row} />,
  },
  {
    field: "members",
    headerName: "Members",
    width: 150,
    editable: false,
    sortable: true,
    renderCell: params => (
      <MembersGroup items={params.row.characters || []} max={3} />
    ),
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
  const { factions } = formState.data
  const rows = factions.map(faction => ({
    ...faction,
    created_at: new Date(faction.created_at),
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
