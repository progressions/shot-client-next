"use client"

import { Box } from "@mui/material"
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid"
import { FormActions } from "@/reducers"
import { MembersGroup, FactionLink } from "@/components/ui"
import { CharacterAvatar, FactionAvatar } from "@/components/avatars"

interface PaginationMeta {
  current_page: number
  next_page: number | null
  prev_page: number | null
  total_pages: number
  total_count: number
}

interface Faction {
  id: number
  name: string
  created_at: string
}

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  factions: Faction[]
  drawerOpen: boolean
}

interface ViewProps {
  formState: { data: FormStateData }
  dispatchForm: (action: {
    type: FormActions
    name: string
    value: unknown
  }) => void
}

const columns: GridColDef<(typeof rows)[number]>[] = [
  {
    field: "avatar",
    headerName: "",
    width: 70,
    editable: false,
    sortable: false,
    renderCell: params => <FactionAvatar faction={params.row} />,
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
      <MembersGroup
        items={params.row.characters || []}
        AvatarComponent={CharacterAvatar}
        itemPropName="character"
        max={3}
      />
    ),
  },
  {
    field: "created_at",
    headerName: "Created At",
    type: "date",
    width: 110,
    editable: false,
  },
]

export default function View({ formState, dispatchForm }: ViewProps) {
  const { meta, sort, order, factions } = formState.data

  const rows = factions.map(faction => ({
    ...faction,
    created_at: new Date(faction.created_at),
  }))

  const onPageChange = (newPage: number) => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "page",
      value: newPage, // Already 1-based from Pagination
    })
  }

  const onSortChange = (model: GridSortModel) => {
    const sortField = model[0]?.field || ""
    const sortOrder = model[0]?.sort || ""
    dispatchForm({
      type: FormActions.UPDATE,
      name: "sort",
      value: sortField,
    })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "order",
      value: sortOrder,
    })
  }

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={meta.total_count}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
              page: meta.current_page - 1, // Convert to 0-based for DataGrid
            },
          },
          sortModel: [
            {
              field: sort,
              sort: order as "asc" | "desc" | undefined,
            },
          ],
        }}
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
        onPaginationModelChange={model => onPageChange(model.page + 1)}
        onSortModelChange={onSortChange}
        sortingMode="server"
        hideFooterPagination
      />
    </Box>
  )
}
