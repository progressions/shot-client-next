"use client"
import { GridColDef } from "@mui/x-data-grid"
import { Box } from "@mui/material"
import { FormStateType, FormStateAction } from "@/reducers"
import {
  BaseDataGrid,
  MembersGroup,
  FactionLink,
  SiteLink,
} from "@/components/ui"
import { EntityAvatar } from "@/components/avatars"
import { SitesTableFormState } from "@/types/forms"

interface ViewProps {
  formState: FormStateType<SitesTableFormState>
  dispatchForm: (action: FormStateAction<SitesTableFormState>) => void
}

const columns: GridColDef<Site>[] = [
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
    renderCell: params => <SiteLink site={params.row} />,
  },
  {
    field: "faction",
    headerName: "Faction",
    width: 200,
    editable: false,
    sortable: false,
    renderCell: params => params.row.faction && <FactionLink faction={params.row.faction} />,
  },
  {
    field: "members",
    headerName: "Attuned",
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
    field: "created_at",
    headerName: "Created",
    type: "date",
    width: 110,
    editable: false,
  },
]

export default function View({ formState, dispatchForm }: ViewProps) {
  const { sites } = formState.data
  const rows = sites.map(site => ({
    ...site,
    created_at: new Date(site.created_at),
  }))

  return (
    <BaseDataGrid
      formState={formState}
      dispatchForm={dispatchForm}
      columns={columns}
      rows={rows}
      sx={{ maxHeight: 800 }}
    />
  )
}
