"use client"
import { GridColDef } from "@mui/x-data-grid"
import { Box } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import { BaseDataGrid, MembersGroup } from "@/components/ui"
import { EntityLink } from "@/components/ui/links"
import { EntityAvatar } from "@/components/avatars"
import type { Adventure, PaginationMeta } from "@/types"

export type AdventuresTableFormState = {
  adventures: Adventure[]
  meta: PaginationMeta
  filters: {
    sort: string
    order: string
    page: number
    search: string
    show_hidden?: boolean
    at_a_glance?: boolean
  }
}

interface ViewProps {
  formState: FormStateType<AdventuresTableFormState>
  dispatchForm: (action: FormStateAction<AdventuresTableFormState>) => void
}

const columns: GridColDef<Adventure>[] = [
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
    width: 350,
    editable: false,
    sortable: true,
    renderCell: params => <EntityLink entity={params.row} />,
  },
  {
    field: "season",
    headerName: "Season",
    width: 100,
    editable: false,
    sortable: true,
    renderCell: params => params.row.season || "-",
  },
  {
    field: "characters",
    headerName: "Heroes",
    width: 150,
    editable: false,
    sortable: false,
    renderCell: params => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <MembersGroup items={params.row.characters || []} max={3} />
      </Box>
    ),
  },
  {
    field: "villains",
    headerName: "Villains",
    width: 150,
    editable: false,
    sortable: false,
    renderCell: params => (
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <MembersGroup items={params.row.villains || []} max={3} />
      </Box>
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

export default function Table({ formState, dispatchForm }: ViewProps) {
  const { adventures } = formState.data
  const rows = adventures.map(adventure => ({
    ...adventure,
    created_at: new Date(adventure.created_at),
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
