"use client"

import * as React from "react"
import Box from "@mui/material/Box"
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid"
import { FormActions } from "@/reducers"
import { FactionLink, CharacterLink } from "@/components/ui"
import { CS } from "@/services"

interface PaginationMeta {
  current_page: number
  next_page: number | null
  prev_page: number | null
  total_pages: number
  total_count: number
}

interface Character {
  id: number
  name: string
  created_at: string
}

interface FormStateData {
  meta: PaginationMeta
  page: number
  sort: string
  order: string
  characters: Character[]
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
    field: "name",
    headerName: "Name",
    width: 240,
    editable: false,
    sortable: true,
    renderCell: params => <CharacterLink character={params.row} />,
  },
  {
    field: "type",
    headerName: "Type",
    width: 110,
    editable: false,
    renderCell: params => CS.type(params.row),
  },
  {
    field: "archtype",
    headerName: "Archetype",
    width: 140,
    editable: false,
    renderCell: params => CS.archetype(params.row),
  },
  {
    field: "faction",
    headerName: "Faction",
    width: 160,
    editable: false,
    renderCell: params => (CS.faction(params.row) ? <FactionLink faction={CS.faction(params.row)} /> : null),
  },
  {
    field: "task",
    headerName: "Task",
    type: "boolean",
    width: 50,
    editable: false,
    renderCell: params => CS.isTask(params.row) ? "Yes" : "",
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
  const { meta, sort, order, characters } = formState.data

  const rows = characters.map(character => ({
    ...character,
    created_at: new Date(character.created_at),
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
