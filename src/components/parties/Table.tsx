"use client"
import { GridColDef } from "@mui/x-data-grid"
import { FormStateType, FormStateAction } from "@/reducers"
import {
  BaseDataGrid,
  FactionLink,
  PartyLink,
  MembersGroup,
} from "@/components/ui"
import { Avatar } from "@/components/avatars"
import { PaginationMeta, Party } from "@/types"

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  parties: Party[]
  drawerOpen: boolean
}

interface ViewProps {
  formState: FormStateType<FormStateData>
  dispatchForm: (action: FormStateAction<FormStateData>) => void
}

const columns: GridColDef<Party>[] = [
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
    renderCell: params => <PartyLink party={params.row} />,
  },
  {
    field: "faction",
    headerName: "Faction",
    width: 150,
    editable: false,
    sortable: true,
    renderCell: params => {
      if (params.row.faction?.id) {
        return <FactionLink faction={params.row.faction} />
      }
      return null
    },
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
  const { parties } = formState.data
  const rows = parties.map(party => ({
    ...party,
    created_at: new Date(party.created_at),
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
